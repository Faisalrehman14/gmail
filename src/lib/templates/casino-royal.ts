/** Casino Royal USA — premium professional email template */

const BASE = "https://casinoroyalusa.com";

export const CASINO_ROYAL_IMAGES = {
  logo: `${BASE}/static/media/logo.2df63040df82a131a01f.png`,
  banner: `${BASE}/static/media/banner.558c358a18ea216e6742.jpg`,
  games: `${BASE}/static/media/gameImg.4731829ffe89b4b426a4.jpg`,
  hero: `${BASE}/static/media/fallbackone.c8e866a7094201539221.jpg`,
};

export const CASINO_ROYAL_SUBJECT = "Discover Casino Royal USA — Premium Social Gaming";

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
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .hero-title { font-size: 24px !important; }
      .feature-col { display: block !important; width: 100% !important; padding: 0 0 14px 0 !important; }
      .stat-col { display: block !important; width: 100% !important; padding: 10px 0 !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; }
      .stat-col-last { border-bottom: none !important; }
      .header-tagline { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#edf0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf0f5;">
    <tr>
      <td align="center" style="padding:28px 12px;">

        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(15,40,71,0.08);">

          <!-- Premium header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2847 0%,#1a3d6b 100%);padding:28px 40px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="170" style="display:block;max-width:170px;height:auto;border:0;" />
                  </td>
                  <td class="header-tagline" align="right" style="vertical-align:middle;">
                    <p style="margin:0;font-size:10px;color:#c9d6e8;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;">Est. Social Gaming</p>
                    <p style="margin:4px 0 0;font-size:10px;color:#8fa8c8;letter-spacing:0.08em;text-transform:uppercase;">Trusted Nationwide</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero banner -->
          <tr>
            <td style="padding:0;line-height:0;position:relative;">
              <img src="${CASINO_ROYAL_IMAGES.banner}" alt="Casino Royal USA — Premium Social Gaming" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Hero headline strip -->
          <tr>
            <td style="background-color:#0f2847;padding:28px 40px;text-align:center;" class="mobile-pad">
              <p style="margin:0 0 8px;font-size:11px;color:#c9a84c;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;">America's Premier Social Casino</p>
              <h1 class="hero-title" style="margin:0;font-size:28px;color:#ffffff;font-weight:700;line-height:1.25;letter-spacing:-0.01em;">
                Experience Gaming at Its Finest
              </h1>
            </td>
          </tr>

          <!-- Introduction -->
          <tr>
            <td style="padding:40px 40px 12px;" class="mobile-pad">
              <p style="margin:0 0 20px;font-size:17px;color:#1e293b;font-weight:600;line-height:1.4;">
                Hello {{first_name}},
              </p>
              <p style="margin:0 0 18px;font-size:16px;color:#475569;line-height:1.75;">
                We are delighted to introduce you to <strong style="color:#0f2847;">Casino Royal USA</strong> — a trusted social gaming platform built on reliability, security, and an exceptional player experience.
              </p>
              <p style="margin:0;font-size:16px;color:#475569;line-height:1.75;">
                Below are the key advantages that set our platform apart and make us a preferred choice for players across the United States.
              </p>
            </td>
          </tr>

          <!-- Key features — 2x2 grid -->
          <tr>
            <td style="padding:28px 32px 12px;" class="mobile-pad">
              <p style="margin:0 0 20px;font-size:12px;color:#0f2847;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;text-align:center;">
                Why Players Choose Us
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="feature-col" width="50%" style="padding:0 8px 16px 0;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-top:3px solid #c9a84c;">
                      <tr>
                        <td style="padding:24px 22px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#c9a84c;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Benefit 01</p>
                          <p style="margin:0 0 8px;font-size:17px;color:#0f2847;font-weight:700;line-height:1.3;">Instant Cash Out</p>
                          <p style="margin:0;font-size:14px;color:#64748b;line-height:1.65;">Withdraw your winnings quickly with our streamlined Cash App process — payouts typically completed within 8–10 minutes.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="feature-col" width="50%" style="padding:0 0 16px 8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-top:3px solid #c9a84c;">
                      <tr>
                        <td style="padding:24px 22px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#c9a84c;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Benefit 02</p>
                          <p style="margin:0 0 8px;font-size:17px;color:#0f2847;font-weight:700;line-height:1.3;">100% Sign-Up Bonus</p>
                          <p style="margin:0;font-size:14px;color:#64748b;line-height:1.65;">New members receive a generous welcome match on their first deposit — double your starting balance from day one.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="feature-col" width="50%" style="padding:0 8px 0 0;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-top:3px solid #1a3d6b;">
                      <tr>
                        <td style="padding:24px 22px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#1a3d6b;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Benefit 03</p>
                          <p style="margin:0 0 8px;font-size:17px;color:#0f2847;font-weight:700;line-height:1.3;">30+ Casino Games Available</p>
                          <p style="margin:0;font-size:14px;color:#64748b;line-height:1.65;">Access a diverse library of premium titles including Orion Stars, Fire Kirin, Milky Way, V-Power, and more.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="feature-col" width="50%" style="padding:0 0 0 8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-top:3px solid #1a3d6b;">
                      <tr>
                        <td style="padding:24px 22px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#1a3d6b;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Benefit 04</p>
                          <p style="margin:0 0 8px;font-size:17px;color:#0f2847;font-weight:700;line-height:1.3;">Trusted &amp; Reliable Platform</p>
                          <p style="margin:0;font-size:14px;color:#64748b;line-height:1.65;">Serving 1,000+ active players with 24/7 dedicated support, secure transactions, and a proven track record.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trust stats bar -->
          <tr>
            <td style="padding:12px 32px 28px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f2847;border-radius:8px;">
                <tr>
                  <td class="stat-col" width="33%" style="padding:20px 12px;text-align:center;border-right:1px solid #1e3d6b;">
                    <p style="margin:0;font-size:22px;color:#c9a84c;font-weight:700;line-height:1.2;">30+</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#94a8c4;letter-spacing:0.06em;text-transform:uppercase;">Games</p>
                  </td>
                  <td class="stat-col" width="33%" style="padding:20px 12px;text-align:center;border-right:1px solid #1e3d6b;">
                    <p style="margin:0;font-size:22px;color:#c9a84c;font-weight:700;line-height:1.2;">24/7</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#94a8c4;letter-spacing:0.06em;text-transform:uppercase;">Support</p>
                  </td>
                  <td class="stat-col stat-col-last" width="33%" style="padding:20px 12px;text-align:center;">
                    <p style="margin:0;font-size:22px;color:#c9a84c;font-weight:700;line-height:1.2;">1,000+</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#94a8c4;letter-spacing:0.06em;text-transform:uppercase;">Players</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Games showcase -->
          <tr>
            <td style="padding:0 32px 32px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0;font-size:12px;color:#0f2847;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Our Game Library</p>
                    <p style="margin:6px 0 0;font-size:15px;color:#64748b;line-height:1.5;">Premium titles, optimized for desktop and mobile play.</p>
                  </td>
                </tr>
                <tr>
                  <td style="line-height:0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
                    <img src="${CASINO_ROYAL_IMAGES.games}" alt="30+ casino games at Casino Royal USA" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <img src="${CASINO_ROYAL_IMAGES.hero}" alt="Casino Royal USA platform" width="536" style="display:block;width:100%;max-width:536px;height:auto;border-radius:8px;border:1px solid #e2e8f0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact section -->
          <tr>
            <td style="padding:0 32px 36px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f8fafc 0%,#eef2f7 100%);border:1px solid #e2e8f0;border-radius:8px;">
                <tr>
                  <td style="padding:36px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:11px;color:#c9a84c;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">Personal Assistance</p>
                    <p style="margin:0 0 8px;font-size:20px;color:#0f2847;font-weight:700;line-height:1.3;">We're Here to Help</p>
                    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.65;max-width:420px;margin-left:auto;margin-right:auto;">
                      Have questions about getting started? Reach out to our team on Facebook — your dedicated channel for support, sign-up assistance, and all platform inquiries.
                    </p>
                    <a href="{{facebook_link}}" target="_blank" style="display:inline-block;padding:15px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;background:linear-gradient(135deg,#1a3d6b,#0f2847);border-radius:6px;letter-spacing:0.04em;box-shadow:0 2px 8px rgba(15,40,71,0.2);">
                      Message Us on Facebook
                    </a>
                    <p style="margin:18px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                      All inquiries, support, and account assistance are handled exclusively through our Facebook page.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f2847;padding:32px 40px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="110" style="display:block;margin:0 auto 18px;max-width:110px;height:auto;border:0;" />
                    <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#ffffff;">Casino Royal USA</p>
                    <p style="margin:0 0 16px;font-size:13px;color:#94a8c4;line-height:1.6;">
                      <a href="{{facebook_link}}" style="color:#c9d6e8;text-decoration:none;font-weight:600;">Connect with us on Facebook</a>
                    </p>
                    <p style="margin:0 0 16px;font-size:12px;color:#6b8299;line-height:1.65;max-width:440px;margin-left:auto;margin-right:auto;">
                      Casino Royal USA is a social gaming platform for entertainment purposes only. Please play responsibly.
                    </p>
                    <p style="margin:0;font-size:11px;color:#5a7088;">
                      <a href="{{unsubscribe_link}}" style="color:#8fa8c8;text-decoration:underline;">Unsubscribe</a>
                      &nbsp;&middot;&nbsp;
                      &copy; ${new Date().getFullYear()} Casino Royal USA. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.5;">
          You received this email because you are on our contact list.
        </p>

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
