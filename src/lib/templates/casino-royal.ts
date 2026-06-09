/** Casino Royal USA — professional branded email template */

const BASE = "https://casinoroyalusa.com";

export const CASINO_ROYAL_IMAGES = {
  logo: `${BASE}/static/media/logo.2df63040df82a131a01f.png`,
  banner: `${BASE}/static/media/banner.558c358a18ea216e6742.jpg`,
  games: `${BASE}/static/media/gameImg.4731829ffe89b4b426a4.jpg`,
  hero: `${BASE}/static/media/fallbackone.c8e866a7094201539221.jpg`,
};

export const CASINO_ROYAL_SUBJECT = "Your exclusive invite — Casino Royal USA";

export const CASINO_ROYAL_HTML = `<!DOCTYPE html>
<html lang="en" data-mailflow="branded">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Casino Royal USA</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .stack { display: block !important; width: 100% !important; }
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .hero-title { font-size: 26px !important; }
      .feature-cell { display: block !important; width: 100% !important; padding: 8px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0a1628;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a1628;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Email container -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">

          <!-- Header / Logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d47a1 0%,#1565c0 50%,#1976d2 100%);padding:28px 40px;text-align:center;" class="mobile-pad">
              <img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Hero Banner -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${CASINO_ROYAL_IMAGES.banner}" alt="America's #1 Social Casino Experience" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Hero Text -->
          <tr>
            <td style="background:linear-gradient(180deg,#1565c0 0%,#0d47a1 100%);padding:32px 40px;text-align:center;" class="mobile-pad">
              <p style="margin:0 0 8px;font-size:13px;color:#90caf9;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">America's #1 Social Casino</p>
              <h1 class="hero-title" style="margin:0 0 12px;font-size:32px;color:#ffffff;font-weight:bold;line-height:1.2;">Get Ready for Serious Fun</h1>
              <p style="margin:0;font-size:16px;color:#bbdefb;line-height:1.5;">Let the good times roll across any device</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 20px;" class="mobile-pad">
              <p style="margin:0 0 16px;font-size:18px;color:#1a1a2e;font-weight:bold;">Hi {{first_name}},</p>
              <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
                Welcome to <strong style="color:#1565c0;">Casino Royal USA</strong> — where over <strong>1,000 players</strong> are already winning big on America's favorite social casino games.
              </p>
              <p style="margin:0;font-size:15px;color:#444;line-height:1.7;">
                We've built something special for you. Here's what awaits:
              </p>
            </td>
          </tr>

          <!-- Feature Cards -->
          <tr>
            <td style="padding:8px 32px 24px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="feature-cell" width="50%" style="padding:8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:10px;border-left:4px solid #1565c0;">
                      <tr><td style="padding:20px;">
                        <p style="margin:0 0 6px;font-size:22px;">🎁</p>
                        <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#1565c0;">100% First Deposit Bonus</p>
                        <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">Exclusive welcome offer for new members</p>
                      </td></tr>
                    </table>
                  </td>
                  <td class="feature-cell" width="50%" style="padding:8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:10px;border-left:4px solid #1565c0;">
                      <tr><td style="padding:20px;">
                        <p style="margin:0 0 6px;font-size:22px;">⚡</p>
                        <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#1565c0;">Instant Cash App</p>
                        <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">Deposits in 1 min · Cashouts in 8–10 mins</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="feature-cell" width="50%" style="padding:8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:10px;border-left:4px solid #1565c0;">
                      <tr><td style="padding:20px;">
                        <p style="margin:0 0 6px;font-size:22px;">🎰</p>
                        <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#1565c0;">Top Winning Games</p>
                        <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">Orion Stars, Fire Kirin, Milky Way & more</p>
                      </td></tr>
                    </table>
                  </td>
                  <td class="feature-cell" width="50%" style="padding:8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:10px;border-left:4px solid #1565c0;">
                      <tr><td style="padding:20px;">
                        <p style="margin:0 0 6px;font-size:22px;">💬</p>
                        <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#1565c0;">24/7 Live Support</p>
                        <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">Always online — we're here to help</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Games Image -->
          <tr>
            <td style="padding:0 32px 24px;" class="mobile-pad">
              <img src="${CASINO_ROYAL_IMAGES.games}" alt="Exciting Casino Games" width="536" style="display:block;width:100%;max-width:536px;height:auto;border-radius:10px;border:0;" />
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td style="padding:8px 40px 36px;text-align:center;" class="mobile-pad">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius:8px;background:#1565c0;padding:0 4px;">
                    <a href="{{website_link}}" target="_blank" style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;background:linear-gradient(135deg,#1976d2,#0d47a1);">
                      ▶ PLAY NOW
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;">
                    <a href="{{facebook_link}}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#1565c0;text-decoration:none;border:2px solid #1565c0;border-radius:8px;background:#ffffff;">
                      💬 Message Us on Facebook
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#888;">Questions? Reply to this email or message us — we respond fast.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e8e8e8;margin:0;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;background:#f8f9fa;text-align:center;border-radius:0 0 12px 12px;" class="mobile-pad">
              <img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="120" style="display:block;margin:0 auto 16px;max-width:120px;height:auto;opacity:0.8;border:0;" />
              <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#333;">Casino Royal USA</p>
              <p style="margin:0 0 12px;font-size:13px;color:#666;">
                <a href="{{website_link}}" style="color:#1565c0;text-decoration:none;">casinoroyalusa.com</a>
                &nbsp;·&nbsp; {{contact_phone}}
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#999;line-height:1.6;">
                America's #1 social casino experience.<br>
                Play responsibly. For entertainment purposes.
              </p>
              <p style="margin:0;font-size:11px;color:#aaa;">
                <a href="{{unsubscribe_link}}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
                &nbsp;·&nbsp; © ${new Date().getFullYear()} Casino Royal USA. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function getCasinoRoyalLinks() {
  return {
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://casinoroyalusa.com",
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK_URL ||
      "https://m.me/YourFacebookPage",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917080849048",
  };
}
