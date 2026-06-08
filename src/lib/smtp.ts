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
  });
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

  const trackingPixel = `<img src="${params.appUrl}/api/track/open/${params.trackingId}" width="1" height="1" alt="" style="display:none" />`;
  const htmlWithTracking = params.html.includes("</body>")
    ? params.html.replace("</body>", `${trackingPixel}</body>`)
    : params.html + trackingPixel;

  const htmlWithClickTracking = htmlWithTracking.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_, url) => `href="${params.appUrl}/api/track/click/${params.trackingId}?url=${encodeURIComponent(url)}"`
  );

  const info = await transporter.sendMail({
    from: `"${params.provider.fromName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: htmlWithClickTracking,
    headers: {
      "X-Tracking-Id": params.trackingId,
    },
  });

  return info;
}

export async function testSmtpConnection(provider: SmtpProvider): Promise<boolean> {
  const transporter = createTransporter(provider);
  await transporter.verify();
  return true;
}
