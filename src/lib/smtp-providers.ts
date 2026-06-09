export interface SmtpPreset {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  usernameHint: string;
  docs: string;
}

export const SMTP_PRESETS: SmtpPreset[] = [
  {
    id: "gmail",
    name: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    usernameHint: "your@gmail.com",
    docs: "Use a Google App Password (not your normal password). Enable 2FA first.",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    usernameHint: "apikey",
    docs: "Username is literally 'apikey'. Password is your SendGrid API key.",
  },
  {
    id: "brevo",
    name: "Brevo (Sendinblue)",
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    usernameHint: "your@email.com",
    docs: "Use your Brevo SMTP login email and SMTP key from Brevo dashboard.",
  },
  {
    id: "mailgun",
    name: "Mailgun",
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    usernameHint: "postmaster@your-domain.mailgun.org",
    docs: "Use Mailgun SMTP credentials from your domain settings.",
  },
  {
    id: "custom",
    name: "Custom SMTP",
    host: "",
    port: 587,
    secure: false,
    usernameHint: "smtp username",
    docs: "Enter your provider SMTP details manually.",
  },
];
