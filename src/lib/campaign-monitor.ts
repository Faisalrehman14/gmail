import { prisma } from "./prisma";
import { getAutopilotStatus } from "./autopilot/engine";
import { getProviderLimits } from "./autopilot/provider-limits";

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export function isGmailAddress(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? GMAIL_DOMAINS.has(domain) : false;
}

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `~${Math.ceil(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.ceil(minutes % 60);
  if (hours < 24) return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `~${days}d ${remHours}h` : `~${days}d`;
}

function calcSendRatePerMinute(
  sentEmails: { sentAt: Date | null }[],
  fallbackDelayMs: number
): number {
  const windowMs = 10 * 60 * 1000;
  const cutoff = Date.now() - windowMs;
  const recent = sentEmails
    .filter((e) => e.sentAt && e.sentAt.getTime() >= cutoff)
    .sort((a, b) => a.sentAt!.getTime() - b.sentAt!.getTime());

  if (recent.length >= 2) {
    const spanMin =
      (recent[recent.length - 1].sentAt!.getTime() - recent[0].sentAt!.getTime()) /
      60_000;
    if (spanMin > 0) return recent.length / spanMin;
  }

  if (recent.length === 1) {
    return 1;
  }

  // Estimate from configured delay between sends
  return fallbackDelayMs > 0 ? 60_000 / fallbackDelayMs : 0;
}

const SENT_STATUSES = new Set(["SENT", "DELIVERED", "OPENED", "CLICKED"]);

export async function getCampaignLiveMonitor(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      smtpProvider: {
        select: { id: true, name: true, host: true, fromEmail: true, fromName: true },
      },
    },
  });

  if (!campaign) throw new Error("Campaign not found");

  const emails = await prisma.campaignEmail.findMany({
    where: { campaignId },
    include: {
      contact: { select: { email: true, firstName: true, lastName: true } },
    },
    orderBy: [{ sentAt: "desc" }, { updatedAt: "desc" }],
  });

  const statusCounts: Record<string, number> = {};
  let gmailRecipients = 0;
  let otherRecipients = 0;

  for (const row of emails) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    if (isGmailAddress(row.contact.email)) gmailRecipients++;
    else otherRecipients++;
  }

  const sent = emails.filter((e) => SENT_STATUSES.has(e.status)).length;
  const queued = emails.filter(
    (e) => e.status === "QUEUED" || e.status === "PENDING"
  ).length;
  const sending = emails.filter((e) => e.status === "SENDING").length;
  const failed = emails.filter((e) => e.status === "FAILED").length;
  const total = emails.length;

  const limits = campaign.smtpProvider
    ? getProviderLimits(campaign.smtpProvider.host, campaign.smtpProvider.name)
    : getProviderLimits("default");

  const sentRows = emails.filter((e) => e.sentAt);
  const ratePerMinute = calcSendRatePerMinute(sentRows, limits.minDelayMs);
  const etaMinutes = ratePerMinute > 0 ? queued / ratePerMinute : null;

  const currentlySending = emails
    .filter((e) => e.status === "SENDING")
    .map((e) => ({
      email: e.contact.email,
      name: [e.contact.firstName, e.contact.lastName].filter(Boolean).join(" ") || null,
    }));

  const recentActivity = emails
    .filter((e) => e.sentAt || e.status === "FAILED" || e.status === "SENDING")
    .slice(0, 30)
    .map((e) => ({
      email: e.contact.email,
      name: [e.contact.firstName, e.contact.lastName].filter(Boolean).join(" ") || null,
      status: e.status,
      isGmail: isGmailAddress(e.contact.email),
      sentAt: e.sentAt?.toISOString() ?? null,
      error: e.errorMessage,
    }));

  const recipients = emails.map((e) => ({
    id: e.id,
    email: e.contact.email,
    name: [e.contact.firstName, e.contact.lastName].filter(Boolean).join(" ") || null,
    status: e.status,
    isGmail: isGmailAddress(e.contact.email),
    sentAt: e.sentAt?.toISOString() ?? null,
    error: e.errorMessage,
  }));

  let autopilot: Awaited<ReturnType<typeof getAutopilotStatus>> | null = null;
  if (campaign.mode === "AUTOPILOT") {
    try {
      autopilot = await getAutopilotStatus(campaignId);
    } catch {
      autopilot = null;
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      mode: campaign.mode,
    },
    sender: campaign.smtpProvider
      ? {
          name: campaign.smtpProvider.fromName,
          email: campaign.smtpProvider.fromEmail,
          host: campaign.smtpProvider.host,
          isGmail: isGmailAddress(campaign.smtpProvider.fromEmail),
        }
      : null,
    summary: {
      total,
      sent,
      queued,
      sending,
      failed,
      percentComplete: total > 0 ? Math.round((sent / total) * 100) : 0,
      gmailRecipients,
      otherRecipients,
    },
    speed: {
      emailsPerMinute: Math.round(ratePerMinute * 10) / 10,
      delayBetweenSendsMs: limits.minDelayMs,
      eta: etaMinutes !== null ? formatDuration(etaMinutes) : null,
      etaMinutes,
    },
    currentlySending,
    recentActivity,
    recipients,
    autopilot: autopilot
      ? {
          canSend: autopilot.rateLimit?.canSend ?? true,
          blockReason: autopilot.rateLimit?.reason,
          sentToday: autopilot.autopilot?.stats.sentToday,
          dailyLimit: autopilot.autopilot?.dailyLimit,
        }
      : null,
    statusCounts,
  };
}
