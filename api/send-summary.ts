export const runtime = "nodejs";
export const preferredRegion = "iad1";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default async function handler(req: { method: string; body: { email: string; name?: string; tasks: Array<{ title: string; status: string; updatedAt: string }> }; }) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const { email, name, tasks } = req.body;

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
  });

  try {
    await ses.send(command);
    return new Response(JSON.stringify({ message: "Email sent" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("SES error", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
