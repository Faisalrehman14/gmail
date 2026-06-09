import { prisma } from "./prisma";

/** Sync SMTP provider from Railway/environment variables on startup */
export async function syncEnvSmtpProvider() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return false;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;
  const fromName = process.env.SMTP_SENDER_NAME || process.env.SMTP_FROM_NAME || "Muhammad";
  const name = process.env.SMTP_NAME || "Production SMTP";

  await prisma.smtpProvider.updateMany({ data: { isDefault: false } });

  await prisma.smtpProvider.upsert({
    where: { id: "env-smtp-provider" },
    update: {
      name,
      host,
      port,
      secure,
      username: user,
      password: pass,
      fromEmail,
      fromName,
      isDefault: true,
      isActive: true,
    },
    create: {
      id: "env-smtp-provider",
      name,
      host,
      port,
      secure,
      username: user,
      password: pass,
      fromEmail,
      fromName,
      isDefault: true,
      isActive: true,
    },
  });

  // Disable fake demo provider if it exists
  await prisma.smtpProvider.updateMany({
    where: { id: "seed-smtp" },
    data: { isDefault: false, isActive: false },
  });

  console.log(`SMTP provider synced from environment: ${host}:${port}`);
  return true;
}

export function hasEnvSmtp(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
