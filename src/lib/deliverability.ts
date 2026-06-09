/** Email deliverability — Primary inbox vs Promotions tab */

export type DeliveryMode = "primary" | "marketing";

export function getDeliveryMode(): DeliveryMode {
  const mode = process.env.EMAIL_DELIVERY_MODE || "primary";
  return mode === "marketing" ? "marketing" : "primary";
}

/** Full branded HTML templates (logo, banners) — sent as-is */
export function isBrandedEmail(html: string): boolean {
  return (
    html.includes('data-mailflow="branded"') ||
    html.trim().startsWith("<!DOCTYPE")
  );
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<img[^>]+alt="([^"]*)"[^>]*>/gi, "[$1]")
    .replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, url, label) => {
      const text = label.replace(/<[^>]+>/g, "").trim();
      return text ? `${text} (${url})` : url;
    })
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&middot;/g, "·")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Multipart plain-text part for branded HTML templates */
export function buildPlainTextBranded(html: string, unsubscribeUrl: string): string {
  return `${htmlToPlainText(html)}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;
}

export function isTrackingEnabled(): boolean {
  return process.env.EMAIL_TRACKING_ENABLED === "true";
}

/** Reduce spam signals for Primary-mode branded sends (wording unchanged) */
export function prepareBrandedForPrimary(html: string): string {
  let result = html;
  if (process.env.EMAIL_STRIP_IMAGES_IN_PRIMARY === "true") {
    result = result.replace(/<img[^>]*>/gi, "");
  }
  return result;
}

/** Marketing headers — good for bulk platforms, triggers Promotions tab in Gmail */
export function buildMarketingHeaders(params: {
  trackingId: string;
  unsubscribeUrl: string;
  fromEmail: string;
}): Record<string, string> {
  return {
    "List-Unsubscribe": `<${params.unsubscribeUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    "Reply-To": params.fromEmail,
    "X-Entity-Ref-ID": params.trackingId,
  };
}

/** Primary inbox headers — looks like a personal 1-to-1 email */
export function buildPrimaryHeaders(params: {
  fromEmail: string;
}): Record<string, string> {
  return {
    "Reply-To": params.fromEmail,
  };
}

/** Marketing-style HTML wrapper (tables, footer) → Promotions tab */
export function wrapMarketingHtml(params: {
  bodyHtml: string;
  unsubscribeUrl: string;
  fromName: string;
  fromEmail: string;
}): string {
  const year = new Date().getFullYear();

  if (params.bodyHtml.includes("<html")) {
    return injectMarketingFooter(params.bodyHtml, params.unsubscribeUrl, params.fromName, year);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;">
        <tr><td style="padding:32px 40px;color:#1a1a1a;font-size:16px;line-height:1.6;">
          ${params.bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #e5e5e5;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888;">
            <a href="${params.unsubscribeUrl}" style="color:#6366f1;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Personal 1-to-1 style — lands in Primary tab */
export function wrapPrimaryHtml(params: {
  bodyHtml: string;
  fromName: string;
  unsubscribeUrl: string;
}): string {
  // Strip heavy HTML if user pasted marketing template
  const body = params.bodyHtml
    .replace(/<h1[^>]*>/gi, "<p>")
    .replace(/<\/h1>/gi, "</p>")
    .replace(/style="[^"]*"/gi, "");

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;line-height:1.6;max-width:600px;">
${body}
<p style="margin-top:24px;color:#222;">${params.fromName}</p>
<p style="margin-top:16px;font-size:12px;color:#888;">
  <a href="${params.unsubscribeUrl}" style="color:#888;">Unsubscribe</a>
</p>
</div>`;
}

export function buildPlainTextPrimary(params: {
  bodyHtml: string;
  fromName: string;
}): string {
  return `${htmlToPlainText(params.bodyHtml)}\n\n${params.fromName}`;
}

export function buildPlainTextMarketing(params: {
  bodyHtml: string;
  fromName: string;
  unsubscribeUrl: string;
}): string {
  return `${htmlToPlainText(params.bodyHtml)}\n\n--\n${params.fromName}\nUnsubscribe: ${params.unsubscribeUrl}`;
}

function injectMarketingFooter(
  html: string,
  unsubscribeUrl: string,
  fromName: string,
  year: number
): string {
  const footer = `<p style="font-size:12px;color:#888;text-align:center;margin-top:24px;">
    <a href="${unsubscribeUrl}" style="color:#6366f1;">Unsubscribe</a> · © ${year} ${fromName}
  </p>`;
  if (html.includes("</body>")) return html.replace("</body>", `${footer}</body>`);
  return html + footer;
}

/** Personal subject — no marketing patterns */
export function sanitizeSubject(subject: string, mode: DeliveryMode): string {
  let s = subject
    .replace(/!{2,}/g, "!")
    .replace(/FREE|URGENT|ACT NOW|CLICK HERE|BUY NOW|OFFER|DISCOUNT/gi, "")
    .trim();

  if (mode === "primary") {
    // Strip bulk/marketing subject patterns that trigger Gmail Promotions tab
    s = s
      .replace(
        /\b(Discover|Premium|Exclusive|Invite|Invitation|Social Gaming|Newsletter|Update|Announcement)\b/gi,
        ""
      )
      .replace(/[-–—|]+\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    // "Hello Name - promo text" → keep only "Hello Name"
    const helloMatch = s.match(/^(Hello\s+\S+)/i);
    if (helloMatch) return helloMatch[1];

    if (!s || s.length < 3) s = "Following up";
  }

  return s;
}

/** Personal from name — use real person name not brand */
export function getSenderName(providerFromName: string): string {
  const brandNames = [
    "mailflow",
    "noreply",
    "no-reply",
    "newsletter",
    "marketing",
    "casino royal",
  ];
  const lower = providerFromName.toLowerCase();
  if (brandNames.some((b) => lower.includes(b))) {
    return process.env.SMTP_SENDER_NAME || "Muhammad";
  }
  return providerFromName;
}
