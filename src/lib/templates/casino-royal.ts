/** Casino Royal USA — ready-to-send email (Primary inbox style) */

export const CASINO_ROYAL_SUBJECT = "Quick note for you";

export const CASINO_ROYAL_HTML = `<p>Hi {{first_name}},</p>

<p>Hope you're doing well. I wanted to tell you about <strong>Casino Royal USA</strong> — a social casino platform that's been getting great feedback from players across America.</p>

<p>Here's what members enjoy most:</p>

<p>• <strong>100% bonus</strong> on your first deposit<br>
• <strong>Instant Cash App</strong> deposits (added within 1 minute)<br>
• Fast cashouts (within 8–10 minutes)<br>
• <strong>24/7 support</strong> — we're always online<br>
• Top games: Orion Stars, Fire Kirin, Milky Way, V-Power, High Roller & more</p>

<p>You can start playing here:<br>
<a href="{{website_link}}">{{website_link}}</a></p>

<p>If you have any questions or want help getting started, <strong>message us directly on Facebook</strong> — we reply fast:</p>

<p><a href="{{facebook_link}}">Message us on Facebook</a></p>

<p>We're here whenever you need us.</p>`;

export function getCasinoRoyalLinks() {
  return {
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://casinoroyalusa.com",
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK_URL ||
      "https://m.me/YourFacebookPage",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917080849048",
  };
}
