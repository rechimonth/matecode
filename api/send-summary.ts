export const preferredRegion = "iad1";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const ses = new SESClient({
  region: process.env.AWS_REGION || "southamerica-east1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

let adminDb: ReturnType<typeof getFirestore> | null = null;

function getAdminDb() {
  if (adminDb) return adminDb;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error("Server misconfiguration: FIREBASE_SERVICE_ACCOUNT_KEY is required");
  }

  let serviceAccount: {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  try {
    serviceAccount = JSON.parse(serviceAccountJson) as typeof serviceAccount;
  } catch {
    throw new Error("Server misconfiguration: FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as Parameters<typeof admin.credential.cert>[0]),
    projectId: serviceAccount.project_id,
  });

  adminDb = getFirestore(app);
  return adminDb;
}

function toDate(value: unknown): Date {
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  return new Date(value as string);
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
  entry.count++;
  return true;
}

function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) return [];
  return origins.split(",").map((o) => o.trim()).filter(Boolean);
}

function getHeader(req: any, name: string): string | null {
  const headers = req.headers || {};
  const value = headers[name] || headers[name.toLowerCase()];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Server misconfiguration: ${label}`);
  }
  return value;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const ip = getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() || getHeader(req, "x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const origin = getHeader(req, "origin");
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.length > 0 && origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "Origin not allowed" });
    }

    let body: { email: string; name?: string; userId: string };
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk as Buffer);
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        return res.status(400).json({ error: "Empty body" });
      }
      body = JSON.parse(raw) as typeof body;
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const email = assertString(body.email, "email is required");
    const userId = assertString(body.userId, "userId is required");
    const fromEmail = assertString(process.env.SES_FROM_EMAIL, "SES_FROM_EMAIL is required");

    let tasks: Array<{ title: string; status: string; updatedAt: string }> = [];
    try {
      const db = getAdminDb();
      const q = db.collection("tasks").where("userId", "==", userId);
      const snapshot = await q.get();
      tasks = snapshot.docs.map((d: any) => {
        const data = d.data();
        return {
          title: data.title,
          status: data.status,
          updatedAt: toDate(data.updatedAt).toISOString(),
        };
      });
    } catch (err) {
      console.error("Firestore query error", err);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }

    const completedCount = tasks.filter((t) => t.status === "completed").length;
    const pendingCount = tasks.filter((t) => t.status === "pending").length;

    const taskList = tasks
      .map((t) => `<li><strong style="color:#2563eb">${t.title}</strong> - ${t.status === "completed" ? "Completada" : "Pendiente"} (${new Date(t.updatedAt).toLocaleString("es-ES")})</li>`)
      .join("");

    const bodyHtml = `
      <html>
        <body style="font-family:Inter,sans-serif;background:#f3f4f6;padding:24px">
          <div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:8px">
            <h1 style="color:#2563eb;margin-bottom:8px">Resumen de tareas - MateCode</h1>
            <p style="color:#4b5563;margin-bottom:24px">Hola ${body.name || ""}, tenés <strong>${pendingCount}</strong> tareas pendientes y <strong>${completedCount}</strong> completadas.</p>
            <ul style="padding-left:24px;color:#1f2937;line-height:1.8">${taskList}</ul>
            <p style="color:#6b7280;margin-top:24px;font-size:14px">MateCode Gestor de Tareas</p>
          </div>
        </body>
      </html>
    `;

    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Resumen de tareas - MateCode", Charset: "UTF-8" },
        Body: { Html: { Data: bodyHtml, Charset: "UTF-8" } },
      },
      ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
    });

    try {
      await ses.send(command);
      return res.status(200).json({ message: "Email sent" });
    } catch (error) {
      console.error("SES error", error);
      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (err) {
    console.error("Unhandled error in send-summary", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}