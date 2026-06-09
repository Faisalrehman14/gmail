export interface ProviderLimits {
  daily: number;
  hourly: number;
  minDelayMs: number;
  type: string;
}

const LIMITS: Record<string, ProviderLimits> = {
  gmail: { daily: 450, hourly: 40, minDelayMs: 3000, type: "gmail" },
  "smtp.gmail.com": { daily: 450, hourly: 40, minDelayMs: 3000, type: "gmail" },
  sendgrid: { daily: 5000, hourly: 200, minDelayMs: 1000, type: "sendgrid" },
  "smtp.sendgrid.net": { daily: 5000, hourly: 200, minDelayMs: 1000, type: "sendgrid" },
  brevo: { daily: 300, hourly: 30, minDelayMs: 2000, type: "brevo" },
  "smtp-relay.brevo.com": { daily: 300, hourly: 30, minDelayMs: 2000, type: "brevo" },
  mailgun: { daily: 5000, hourly: 300, minDelayMs: 1000, type: "mailgun" },
  default: { daily: 200, hourly: 25, minDelayMs: 5000, type: "custom" },
};

export function getProviderLimits(host: string, name?: string): ProviderLimits {
  const hostKey = host.toLowerCase();
  if (LIMITS[hostKey]) return LIMITS[hostKey];

  const nameKey = (name || "").toLowerCase();
  for (const [key, limits] of Object.entries(LIMITS)) {
    if (nameKey.includes(key) || hostKey.includes(key)) return limits;
  }

  return LIMITS.default;
}

export function estimateDays(contactCount: number, dailyLimit: number): number {
  return Math.ceil(contactCount / dailyLimit);
}
