export const runtime = "nodejs";
export const preferredRegion = "iad1";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "southamerica-east1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Rate limiting simple por IP (en memoria)
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimit.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) return [];
  return origins.split(",").map((o) => o.trim()).filter(Boolean);
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  // Rate limit por IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json" } });
  }

  // Validar origen
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length > 0 && origin && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  let body: { email: string; name?: string; tasks: Array<{ title: string; status: string; updatedAt: string }> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { email, name, tasks } = body;

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  const taskList = tasks
    .map((t) => `<li><strong style="color:#2563eb">${t.title}</strong> - ${t.status === "completed" ? "Completada" : "Pendiente"} (${t.updatedAt})</li>`)
    .join("");

  const bodyHtml = `
    <html>
      <body style="font-family:Inter,sans-serif;background:#f3f4f6;padding:24px">
        <div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:8px">
          <h1 style="color:#2563eb;margin-bottom:8px">Resumen de tareas - MateCode</h1>
          <p style="color:#4b5563;margin-bottom:24px">Hola ${name || ""}, tenés <strong>${pendingCount}</strong> tareas pendientes y <strong>${completedCount}</strong> completadas.</p>
          <ul style="padding-left:24px;color:#1f2937;line-height:1.8">${taskList}</ul>
          <p style="color:#6b7280;margin-top:24px;font-size:14px">MateCode Gestor de Tareas</p>
        </div>
      </body>
    </html>
  `;

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL || "",
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Resumen de tareas - MateCode", Charset: "UTF-8" },
      Body: { Html: { Data: bodyHtml, Charset: "UTF-8" } },
    },
    ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
  });

  try {
    await ses.send(command);
    return new Response(JSON.stringify({ message: "Email sent" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("SES error", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
