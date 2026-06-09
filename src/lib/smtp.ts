import nodemailer from "nodemailer";
import type { SmtpProvider } from "@prisma/client";
import {
  htmlToPlainText,
  buildMarketingHeaders,
  buildPrimaryHeaders,
  wrapMarketingHtml,
  wrapPrimaryHtml,
  buildPlainTextPrimary,
  buildPlainTextMarketing,
  sanitizeSubject,
  getSenderName,
  getDeliveryMode,
  isBrandedEmail,
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
  const trackingPixel = `<img src="${appUrl}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`;
  const htmlWithPixel = html.includes("</body>")
    ? html.replace("</body>", `${trackingPixel}</body>`)
    : html + trackingPixel;

  return htmlWithPixel.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (match, url) => {
      if (url.includes("/api/track/") || url.includes("casinoroyalusa.com/static/")) {
        return match;
      }
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
  const branded = isBrandedEmail(params.html);
  const mode = branded ? "marketing" : getDeliveryMode();
  const senderName = branded
    ? params.provider.fromName || "Casino Royal USA"
    : getSenderName(params.provider.fromName);
  const unsubscribeUrl = `${params.appUrl}/api/track/unsubscribe/${params.trackingId}`;
  const subject = sanitizeSubject(params.subject, branded ? "marketing" : mode);

  let html: string;
  let text: string;
  let headers: Record<string, string>;

  if (branded) {
    // Professional branded template — use as-is with tracking
    html = injectTracking(params.html, params.trackingId, params.appUrl);
    text = htmlToPlainText(params.html);
    headers = buildMarketingHeaders({
      trackingId: params.trackingId,
      unsubscribeUrl,
      fromEmail: params.provider.fromEmail,
    });
  } else if (mode === "primary") {
    html = wrapPrimaryHtml({
      bodyHtml: params.html,
      fromName: senderName,
      unsubscribeUrl,
    });
    text = buildPlainTextPrimary({ bodyHtml: params.html, fromName: senderName });
    headers = buildPrimaryHeaders({ fromEmail: params.provider.fromEmail });
  } else {
    const wrapped = wrapMarketingHtml({
      bodyHtml: params.html,
      unsubscribeUrl,
      fromName: params.provider.fromName,
      fromEmail: params.provider.fromEmail,
    });
    html = injectTracking(wrapped, params.trackingId, params.appUrl);
    text = buildPlainTextMarketing({
      bodyHtml: params.html,
      fromName: params.provider.fromName,
      unsubscribeUrl,
    });
    headers = buildMarketingHeaders({
      trackingId: params.trackingId,
      unsubscribeUrl,
      fromEmail: params.provider.fromEmail,
    });
  }

  const info = await transporter.sendMail({
    from: `"${senderName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject,
    text,
    html,
    replyTo: params.provider.fromEmail,
    headers,
  });

  return info;
}

export async function sendTestEmail(params: {
  provider: SmtpProvider;
  to: string;
  appUrl: string;
}) {
  const transporter = createTransporter(params.provider);
  const { CASINO_ROYAL_HTML, CASINO_ROYAL_SUBJECT } = await import(
    "./templates/casino-royal"
  );

  const html = CASINO_ROYAL_HTML.replace(
    /\{\{unsubscribe_link\}\}/g,
    params.appUrl
  ).replace(/\{\{first_name\}\}/g, "there");

  return transporter.sendMail({
    from: `"Casino Royal USA" <${params.provider.fromEmail}>`,
    to: params.to,
    subject: CASINO_ROYAL_SUBJECT,
    text: htmlToPlainText(html),
    html,
    replyTo: params.provider.fromEmail,
    headers: buildPrimaryHeaders({ fromEmail: params.provider.fromEmail }),
  });
}

export async function testSmtpConnection(provider: SmtpProvider): Promise<boolean> {
  const transporter = createTransporter(provider);
  await transporter.verify();
  return true;
}
