/** Casino Royal USA — professional corporate email template */

const BASE = "https://casinoroyalusa.com";

export const CASINO_ROYAL_IMAGES = {
  logo: `${BASE}/static/media/logo.2df63040df82a131a01f.png`,
  banner: `${BASE}/static/media/banner.558c358a18ea216e6742.jpg`,
  games: `${BASE}/static/media/gameImg.4731829ffe89b4b426a4.jpg`,
  hero: `${BASE}/static/media/fallbackone.c8e866a7094201539221.jpg`,
};

export const CASINO_ROYAL_SUBJECT = "An invitation from Casino Royal USA";

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
      .mobile-pad { padding-left: 24px !important; padding-right: 24px !important; }
      .hero-title { font-size: 22px !important; line-height: 1.35 !important; }
      .benefit-cell { display: block !important; width: 100% !important; padding: 0 0 16px 0 !important; }
      .banner-img { border-radius: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:Georgia,'Times New Roman',Times,serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dde3ea;border-radius:4px;overflow:hidden;">

          <!-- Brand accent -->
          <tr>
            <td style="height:4px;background-color:#1e3a5f;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 48px 24px;border-bottom:1px solid #eef1f5;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="160" style="display:block;max-width:160px;height:auto;border:0;" />
                  </td>
                  <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0;font-size:11px;color:#6b7c93;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Social Gaming Platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img class="banner-img" src="${CASINO_ROYAL_IMAGES.banner}" alt="Casino Royal USA" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:40px 48px 8px;" class="mobile-pad">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7c93;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Member Communication</p>
              <h1 class="hero-title" style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:26px;color:#1a2b42;font-weight:600;line-height:1.3;letter-spacing:-0.02em;">
                Welcome to Casino Royal USA
              </h1>
              <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#3d4f66;line-height:1.75;">
                Dear {{first_name}},
              </p>
              <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#3d4f66;line-height:1.75;">
                Thank you for your interest in <strong style="color:#1e3a5f;font-weight:600;">Casino Royal USA</strong>. We are pleased to introduce our social gaming platform, designed to deliver a secure, reliable, and engaging experience for players across the United States.
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#3d4f66;line-height:1.75;">
                As a valued contact, we would like to share an overview of what our platform offers and how our team can assist you.
              </p>
            </td>
          </tr>

          <!-- Benefits -->
          <tr>
            <td style="padding:32px 48px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e8edf3;border-radius:4px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1e3a5f;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Platform Highlights</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="benefit-cell" width="50%" style="padding:0 12px 0 0;vertical-align:top;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a2b42;font-weight:600;">Member Welcome Program</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a6b7f;line-height:1.6;">Structured onboarding with benefits for new members.</p>
                        </td>
                        <td class="benefit-cell" width="50%" style="padding:0 0 0 12px;vertical-align:top;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a2b42;font-weight:600;">Secure Transactions</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a6b7f;line-height:1.6;">Cash App integration with efficient deposit and withdrawal processing.</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="height:20px;font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td class="benefit-cell" width="50%" style="padding:0 12px 0 0;vertical-align:top;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a2b42;font-weight:600;">Curated Game Library</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a6b7f;line-height:1.6;">A selection of popular titles including Orion Stars, Fire Kirin, and Milky Way.</p>
                        </td>
                        <td class="benefit-cell" width="50%" style="padding:0 0 0 12px;vertical-align:top;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a2b42;font-weight:600;">Dedicated Support</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a6b7f;line-height:1.6;">Our support team is available around the clock to assist with inquiries.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Visual -->
          <tr>
            <td style="padding:0 48px 32px;" class="mobile-pad">
              <img src="${CASINO_ROYAL_IMAGES.games}" alt="Casino Royal USA gaming platform" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:1px solid #e8edf3;border-radius:4px;" />
              <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a97a8;line-height:1.5;text-align:center;">
                A premium social gaming experience, accessible on desktop and mobile devices.
              </p>
            </td>
          </tr>

          <!-- Contact CTA -->
          <tr>
            <td style="padding:8px 48px 40px;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e3a5f;border-radius:4px;">
                <tr>
                  <td style="padding:32px;text-align:center;">
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#a8bdd4;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">Get in Touch</p>
                    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#ffffff;line-height:1.6;">
                      Our team is available to answer questions and provide personalized assistance.
                    </p>
                    <a href="{{facebook_link}}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#1e3a5f;text-decoration:none;background-color:#ffffff;border-radius:4px;letter-spacing:0.02em;">
                      Contact Us on Facebook
                    </a>
                    <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#a8bdd4;line-height:1.6;">
                      You may also reply directly to this email — we aim to respond promptly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Website reference -->
          <tr>
            <td style="padding:0 48px 32px;text-align:center;" class="mobile-pad">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a6b7f;line-height:1.6;">
                Learn more at
                <a href="{{website_link}}" style="color:#1e3a5f;text-decoration:none;font-weight:600;border-bottom:1px solid #c5d0dc;">casinoroyalusa.com</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;"><hr style="border:none;border-top:1px solid #e8edf3;margin:0;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 48px 36px;background-color:#f8fafc;" class="mobile-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="${CASINO_ROYAL_IMAGES.logo}" alt="Casino Royal USA" width="100" style="display:block;margin:0 auto 16px;max-width:100px;height:auto;opacity:0.85;border:0;" />
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#1a2b42;">Casino Royal USA</p>
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7c93;line-height:1.6;">
                      <a href="{{website_link}}" style="color:#1e3a5f;text-decoration:none;">casinoroyalusa.com</a>
                      &nbsp;&middot;&nbsp;
                      {{contact_phone}}
                    </p>
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a97a8;line-height:1.65;max-width:480px;margin-left:auto;margin-right:auto;">
                      Casino Royal USA is a social gaming platform for entertainment purposes. Please play responsibly.
                    </p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a8b4c0;">
                      <a href="{{unsubscribe_link}}" style="color:#8a97a8;text-decoration:underline;">Unsubscribe</a>
                      &nbsp;&middot;&nbsp;
                      &copy; ${new Date().getFullYear()} Casino Royal USA. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outer footer note -->
        <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a97a8;text-align:center;line-height:1.5;">
          You are receiving this message because you were added to our contact list.
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
