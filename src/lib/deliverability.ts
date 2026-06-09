/** Email deliverability helpers — reduce spam folder placement */

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildDeliverabilityHeaders(params: {
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

export function wrapEmailHtml(params: {
  bodyHtml: string;
  unsubscribeUrl: string;
  fromName: string;
  fromEmail: string;
}): string {
  const year = new Date().getFullYear();

  // Already a full document
  if (params.bodyHtml.includes("<html")) {
    return injectFooter(params.bodyHtml, params.unsubscribeUrl, params.fromName, year);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;max-width:600px;width:100%;">
          <tr>
            <td style="padding:32px 40px;color:#1a1a1a;font-size:16px;line-height:1.6;">
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e5e5e5;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#888;">
                You received this email because you are subscribed to ${params.fromName}.
              </p>
              <p style="margin:0;font-size:12px;color:#888;">
                <a href="${params.unsubscribeUrl}" style="color:#6366f1;text-decoration:underline;">Unsubscribe</a>
                &nbsp;·&nbsp; ${params.fromEmail}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#aaa;">© ${year} ${params.fromName}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function injectFooter(
  html: string,
  unsubscribeUrl: string,
  fromName: string,
  year: number
): string {
  const footer = `<p style="font-size:12px;color:#888;text-align:center;margin-top:24px;">
    <a href="${unsubscribeUrl}" style="color:#6366f1;">Unsubscribe</a> · © ${year} ${fromName}
  </p>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${footer}</body>`);
  }
  return html + footer;
}

/** Subject line cleanup — avoid spam trigger patterns */
export function sanitizeSubject(subject: string): string {
  return subject
    .replace(/!{2,}/g, "!")
    .replace(/FREE|URGENT|ACT NOW|CLICK HERE|BUY NOW/gi, (m) => m.charAt(0) + m.slice(1).toLowerCase())
    .trim();
}
