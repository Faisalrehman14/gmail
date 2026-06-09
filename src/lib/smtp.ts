import nodemailer from "nodemailer";
import type { SmtpProvider } from "@prisma/client";

export function createTransporter(provider: SmtpProvider) {
  return nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.secure,
    auth: {
      user: provider.username,
      pass: provider.password,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  });
}

function injectTracking(html: string, trackingId: string, appUrl: string) {
  const trackingPixel = `<img src="${appUrl}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none" />`;
  const htmlWithPixel = html.includes("</body>")
    ? html.replace("</body>", `${trackingPixel}</body>`)
    : html + trackingPixel;

  return htmlWithPixel.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_, url) =>
      `href="${appUrl}/api/track/click/${trackingId}?url=${encodeURIComponent(url)}"`
  );
}

export async function sendEmail(params: {
  provider: SmtpProvider;
  to: string;
  subject: string;
  html: string;
  trackingId: string;
  appUrl: string;
}) {
  const transporter = createTransporter(params.provider);
  const html = injectTracking(params.html, params.trackingId, params.appUrl);

  const info = await transporter.sendMail({
    from: `"${params.provider.fromName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html,
    headers: { "X-Tracking-Id": params.trackingId },
  });

  return info;
}

export async function sendTestEmail(params: {
  provider: SmtpProvider;
  to: string;
  appUrl: string;
}) {
  const transporter = createTransporter(params.provider);

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h2 style="color:#6366f1">MailFlow Test Email</h2>
      <p>Your SMTP configuration is working correctly.</p>
      <p><strong>Provider:</strong> ${params.provider.name}</p>
      <p><strong>Host:</strong> ${params.provider.host}:${params.provider.port}</p>
      <p><strong>From:</strong> ${params.provider.fromEmail}</p>
      <p style="color:#64748b;font-size:13px">Sent at ${new Date().toUTCString()}</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"${params.provider.fromName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject: "MailFlow — SMTP Test Successful",
    html,
  });
}

export async function testSmtpConnection(provider: SmtpProvider): Promise<boolean> {
  const transporter = createTransporter(provider);
  await transporter.verify();
  return true;
}
