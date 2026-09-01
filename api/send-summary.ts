import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { IncomingMessage } from "node:http";

type ApiRequest = IncomingMessage & {
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (payload: Record<string, unknown>) => ApiResponse;
  setHeader: (name: string, value: string) => ApiResponse;
  end: () => void;
};

type SummaryBody = {
  name?: unknown;
};

type FirestoreTask = {
  title?: unknown;
  status?: unknown;
  updatedAt?: unknown;
};

export const preferredRegion = "iad1";

const sesConfig: ConstructorParameters<typeof SESClient>[0] = {
  region: process.env.AWS_REGION || "sa-east-1",
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  sesConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const ses = new SESClient(sesConfig);

let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;

function getAdminApp() {
  if (getApps().length > 0) return getApp();

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error("Server misconfiguration: Firebase service account is missing");
  }

  let serviceAccount: { project_id: string; client_email: string; private_key: string };
  try {
    const parsed = JSON.parse(serviceAccountJson) as Partial<typeof serviceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      throw new Error("Missing service account fields");
    }
    serviceAccount = {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    throw new Error("Server misconfiguration: invalid Firebase service account");
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

function getAdminAuth() {
  if (!adminAuth) adminAuth = getAuth(getAdminApp());
  return adminAuth;
}

function getAdminDb() {
  if (!adminDb) adminDb = getFirestore(getAdminApp());
  return adminDb;
}

function toDate(value: unknown): Date {
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimit.set(ip, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function getHeader(req: ApiRequest, name: string): string | null {
  const value = req.headers[name.toLowerCase()];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function applyCors(res: ApiResponse, origin: string | null, allowedOrigins: string[]) {
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Vary", "Origin");
  }
}

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const getBearerToken = (authorization: string | null): string | null => {
  if (!authorization) return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization.trim());
  return match?.[1] ?? null;
};

async function readJsonBody(req: ApiRequest): Promise<SummaryBody> {
  if (req.body && typeof req.body === "object") return req.body as SummaryBody;

  let raw = "";
  for await (const chunk of req) {
    raw += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
  }

  if (!raw.trim()) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid JSON body");
  }
  return parsed as SummaryBody;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const origin = getHeader(req, "origin");
  const allowedOrigins = getAllowedOrigins();
  applyCors(res, origin, allowedOrigins);

  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() || getHeader(req, "x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const token = getBearerToken(getHeader(req, "authorization"));
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  let decodedToken: Awaited<ReturnType<ReturnType<typeof getAuth>["verifyIdToken"]>>;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired authentication token" });
  }

  const email = decodedToken.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Authenticated account has no valid email" });
  }

  let body: SummaryBody;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const fromEmail = process.env.SES_FROM_EMAIL?.trim();
  if (!fromEmail) {
    console.error("SES_FROM_EMAIL is not configured");
    return res.status(500).json({ error: "Email service is not configured" });
  }

  let tasks: Array<{ title: string; status: string; updatedAt: string }> = [];
  try {
    const snapshot = await getAdminDb()
      .collection("tasks")
      .where("userId", "==", decodedToken.uid)
      .get();

    tasks = snapshot.docs.map((document) => {
      const data = document.data() as FirestoreTask;
      return {
        title: typeof data.title === "string" ? data.title : "Sin título",
        status: data.status === "completed" ? "completed" : "pending",
        updatedAt: toDate(data.updatedAt).toISOString(),
      };
    });
  } catch (err) {
    console.error("Firestore query failed", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const pendingCount = tasks.length - completedCount;
  const taskList = tasks.length
    ? tasks
        .map((task) => {
          const title = escapeHtml(task.title);
          const updatedAt = escapeHtml(new Date(task.updatedAt).toLocaleString("es-ES"));
          const status = task.status === "completed" ? "Completada" : "Pendiente";
          return `<li><strong style="color:#2563eb">${title}</strong> - ${status} (${updatedAt})</li>`;
        })
        .join("")
    : "<li>No tenés tareas registradas.</li>";

  const safeName = escapeHtml(name);
  const bodyHtml = `
    <!doctype html>
    <html lang="es">
      <head><meta charset="UTF-8"><title>Resumen de tareas - MateCode</title></head>
      <body style="font-family:Inter,Arial,sans-serif;background:#f3f4f6;padding:24px">
        <main style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:8px">
          <h1 style="color:#2563eb;margin-bottom:8px">Resumen de tareas - MateCode</h1>
          <p style="color:#4b5563;margin-bottom:24px">Hola ${safeName}, tenés <strong>${pendingCount}</strong> tareas pendientes y <strong>${completedCount}</strong> completadas.</p>
          <ul style="padding-left:24px;color:#1f2937;line-height:1.8">${taskList}</ul>
          <p style="color:#6b7280;margin-top:24px;font-size:14px">MateCode Gestor de Tareas</p>
        </main>
      </body>
    </html>
  `;

  try {
    await ses.send(
      new SendEmailCommand({
        Source: fromEmail,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: "Resumen de tareas - MateCode", Charset: "UTF-8" },
          Body: { Html: { Data: bodyHtml, Charset: "UTF-8" } },
        },
        ...(process.env.SES_CONFIGURATION_SET
          ? { ConfigurationSetName: process.env.SES_CONFIGURATION_SET }
          : {}),
      })
    );
    return res.status(200).json({ message: "Email sent" });
  } catch (err) {
    console.error("SES send failed", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Failed to send email" });
  }
}
