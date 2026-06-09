/** Casino Royal USA — Primary inbox email with light branding images */

const BASE = "https://casinoroyalusa.com";

export const CASINO_ROYAL_IMAGES = {
  logo: `${BASE}/static/media/logo.2df63040df82a131a01f.png`,
  banner: `${BASE}/static/media/banner.558c358a18ea216e6742.jpg`,
  games: `${BASE}/static/media/gameImg.4731829ffe89b4b426a4.jpg`,
  hero: `${BASE}/static/media/fallbackone.c8e866a7094201539221.jpg`,
};

export const CASINO_ROYAL_SUBJECT = "Hello {{first_name}}";

/**
 * HTML fragment (no DOCTYPE) — stays in Primary mode.
 * Images use width/alt only (no inline styles) so primary wrapper keeps them intact.
 */
export const CASINO_ROYAL_HTML = `<center>
<img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="150" border="0">
</center>

<p>Hello {{first_name}},</p>

<p>I hope this message finds you well. I wanted to share some information about <strong>Casino Royal USA</strong>, our social gaming platform for players across the United States.</p>

<center>
<img src="${CASINO_ROYAL_IMAGES.banner}" alt="Casino Royal USA" width="560" border="0">
</center>

<p>Here are the key highlights of our platform:</p>

<p>
<strong>Instant Cash Out</strong> — Fast withdrawals through Cash App, typically completed within 8–10 minutes.<br><br>
<strong>100% Sign-Up Bonus</strong> — A welcome match for new members on their first deposit.<br><br>
<strong>30+ Casino Games Available</strong> — A curated library including Orion Stars, Fire Kirin, Milky Way, V-Power, and more.<br><br>
<strong>Trusted and Reliable Platform</strong> — Serving 1,000+ active players with 24/7 dedicated support.
</p>

<center>
<img src="${CASINO_ROYAL_IMAGES.games}" alt="Casino Royal USA games" width="560" border="0">
</center>

<p>Our team handles all inquiries through Facebook. If you have questions or need help getting started, you can reach us here:</p>

<p><a href="{{facebook_link}}">Connect with us on Facebook</a></p>

<p>Thank you for your time. We look forward to hearing from you.</p>`;

export function getCasinoRoyalLinks() {
  return {
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://casinoroyalusa.com",
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK_URL ||
      "https://www.facebook.com/casinoroyalusa12",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917080849048",
  };
}
