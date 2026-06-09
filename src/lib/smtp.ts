import nodemailer from "nodemailer";
import type { SmtpProvider } from "@prisma/client";
import {
  htmlToPlainText,
  buildDeliverabilityHeaders,
  wrapEmailHtml,
  sanitizeSubject,
} from "./deliverability";

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
  const trackingPixel = `<img src="${appUrl}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0" />`;
  const htmlWithPixel = html.includes("</body>")
    ? html.replace("</body>", `${trackingPixel}</body>`)
    : html + trackingPixel;

  return htmlWithPixel.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (match, url) => {
      if (url.includes("/api/track/")) return match;
      return `href="${appUrl}/api/track/click/${trackingId}?url=${encodeURIComponent(url)}"`;
    }
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
  const unsubscribeUrl = `${params.appUrl}/api/track/unsubscribe/${params.trackingId}`;

  const wrappedHtml = wrapEmailHtml({
    bodyHtml: params.html,
    unsubscribeUrl,
    fromName: params.provider.fromName,
    fromEmail: params.provider.fromEmail,
  });

  const html = injectTracking(wrappedHtml, params.trackingId, params.appUrl);
  const text = htmlToPlainText(params.html) + `\n\nUnsubscribe: ${unsubscribeUrl}`;
  const subject = sanitizeSubject(params.subject);

  const info = await transporter.sendMail({
    from: `"${params.provider.fromName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject,
    html,
    text,
    replyTo: params.provider.fromEmail,
    headers: buildDeliverabilityHeaders({
      trackingId: params.trackingId,
      unsubscribeUrl,
      fromEmail: params.provider.fromEmail,
    }),
  });

  return info;
}

export async function sendTestEmail(params: {
  provider: SmtpProvider;
  to: string;
  appUrl: string;
}) {
  const transporter = createTransporter(params.provider);

  const html = wrapEmailHtml({
    bodyHtml: `
      <h2 style="color:#333;margin-top:0">SMTP Test Successful</h2>
      <p>Your MailFlow email configuration is working correctly.</p>
      <p>This is a deliverability-optimized test message with proper headers and plain-text fallback.</p>
    `,
    unsubscribeUrl: `${params.appUrl}`,
    fromName: params.provider.fromName,
    fromEmail: params.provider.fromEmail,
  });

  return transporter.sendMail({
    from: `"${params.provider.fromName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject: "MailFlow — Configuration Test",
    html,
    text: "Your MailFlow SMTP configuration is working correctly.",
    replyTo: params.provider.fromEmail,
  });
}

export async function testSmtpConnection(provider: SmtpProvider): Promise<boolean> {
  const transporter = createTransporter(provider);
  await transporter.verify();
  return true;
}
