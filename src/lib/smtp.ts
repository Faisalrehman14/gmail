import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { SmtpProvider } from "@prisma/client";
import {
  htmlToPlainText,
  buildMarketingHeaders,
  buildPrimaryHeaders,
  wrapMarketingHtml,
  wrapPrimaryHtml,
  buildPlainTextPrimary,
  buildPlainTextMarketing,
  buildPlainTextBranded,
  sanitizeSubject,
  getSenderName,
  getDeliveryMode,
  isBrandedEmail,
  isTrackingEnabled,
  prepareBrandedForPrimary,
} from "./deliverability";
import { getProviderLimits } from "./autopilot/provider-limits";

const transporterCache = new Map<string, Transporter>();

function isGmailHost(host: string): boolean {
  return host.toLowerCase().includes("gmail");
}

export function isLoginRateLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("too many login attempts") ||
    lower.includes("454 4.7.0") ||
    lower.includes("421 4.7.0") ||
    lower.includes("rate limit exceeded")
  );
}

export function clearTransporterCache(providerId?: string) {
  if (providerId) {
    const t = transporterCache.get(providerId);
    if (t) t.close();
    transporterCache.delete(providerId);
  } else {
    for (const t of transporterCache.values()) t.close();
    transporterCache.clear();
  }
}

/** Reuse one pooled SMTP connection — avoids Gmail "too many login attempts" */
export function getTransporter(provider: SmtpProvider): Transporter {
  const cached = transporterCache.get(provider.id);
  if (cached) return cached;

  const limits = getProviderLimits(provider.host, provider.name);
  const gmail = isGmailHost(provider.host);

  const transporter = nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.secure,
    auth: {
      user: provider.username,
      pass: provider.password,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: gmail ? 100 : 500,
    rateDelta: gmail ? 60_000 : 10_000,
    rateLimit: gmail ? Math.max(1, Math.floor(60_000 / limits.minDelayMs)) : 10,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  });

  transporterCache.set(provider.id, transporter);
  return transporter;
}

export function createTransporter(provider: SmtpProvider) {
  return getTransporter(provider);
}

function injectTracking(html: string, trackingId: string, appUrl: string) {
  const trackingPixel = `<img src="${appUrl}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`;
  const htmlWithPixel = html.includes("</body>")
    ? html.replace("</body>", `${trackingPixel}</body>`)
    : html + trackingPixel;

  return htmlWithPixel.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (match, url) => {
      if (
        url.includes("/api/track/") ||
        url.includes("casinoroyalusa.com/static/") ||
        url.includes("facebook.com") ||
        url.includes("m.me/")
      ) {
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
  transporter?: Transporter;
}) {
  const transporter = params.transporter ?? getTransporter(params.provider);
  const branded = isBrandedEmail(params.html);
  const mode = getDeliveryMode();
  const senderName = getSenderName(params.provider.fromName);
  const unsubscribeUrl = `${params.appUrl}/api/track/unsubscribe/${params.trackingId}`;
  const subject = sanitizeSubject(params.subject, mode);

  let html: string;
  let text: string;
  let headers: Record<string, string>;

  if (branded && mode === "primary") {
    const primaryHtml = prepareBrandedForPrimary(params.html);
    html = primaryHtml;
    text = buildPlainTextPrimary({
      bodyHtml: primaryHtml,
      fromName: senderName,
    });
    headers = buildPrimaryHeaders({ fromEmail: params.provider.fromEmail });
  } else if (branded) {
    html = isTrackingEnabled()
      ? injectTracking(params.html, params.trackingId, params.appUrl)
      : params.html;
    text = buildPlainTextBranded(params.html, unsubscribeUrl);
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

  try {
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
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (isLoginRateLimitError(msg)) {
      clearTransporterCache(params.provider.id);
    }
    throw error;
  }
}

export async function sendTestEmail(params: {
  provider: SmtpProvider;
  to: string;
  appUrl: string;
}) {
  const transporter = getTransporter(params.provider);
  const { CASINO_ROYAL_HTML, CASINO_ROYAL_SUBJECT } = await import(
    "./templates/casino-royal"
  );

  const senderName = getSenderName(params.provider.fromName);
  const unsubscribeUrl = `${params.appUrl}/api/track/unsubscribe/test`;
  const html = CASINO_ROYAL_HTML.replace(
    /\{\{unsubscribe_link\}\}/g,
    unsubscribeUrl
  ).replace(/\{\{first_name\}\}/g, "there");
  const subject = sanitizeSubject(
    CASINO_ROYAL_SUBJECT.replace(/\{\{first_name\}\}/g, "there"),
    "primary"
  );
  const wrappedHtml = wrapPrimaryHtml({
    bodyHtml: html,
    fromName: senderName,
    unsubscribeUrl,
  });

  return transporter.sendMail({
    from: `"${senderName}" <${params.provider.fromEmail}>`,
    to: params.to,
    subject,
    text: buildPlainTextPrimary({ bodyHtml: html, fromName: senderName }),
    html: wrappedHtml,
    replyTo: params.provider.fromEmail,
    headers: buildPrimaryHeaders({ fromEmail: params.provider.fromEmail }),
  });
}

export async function testSmtpConnection(provider: SmtpProvider): Promise<boolean> {
  const transporter = getTransporter(provider);
  await transporter.verify();
  return true;
}
