import { prisma } from "../prisma";
import { queueCampaignEmails } from "../campaign-service";
import { logActivity } from "../activity";
import { getProviderLimits, estimateDays } from "./provider-limits";
import { verifyContactList } from "./verification";
import { checkRateLimit } from "./rate-limiter";
import type {
  AutopilotConfig,
  AutopilotLaunchInput,
  AutopilotLaunchResult,
} from "./types";

export function createDefaultConfig(
  contactCount: number,
  host: string,
  providerName?: string,
  timezone = process.env.AUTOPILOT_TIMEZONE || "Asia/Karachi"
): AutopilotConfig {
  const limits = getProviderLimits(host, providerName);
  const dailyLimit = Math.floor(limits.daily * 0.9); // 10% safety margin
  const hourlyLimit = Math.floor(limits.hourly * 0.85);
  const startHour = parseInt(process.env.AUTOPILOT_SEND_START || "0", 10);
  const endHour = parseInt(process.env.AUTOPILOT_SEND_END || "24", 10);

  return {
    dailyLimit,
    hourlyLimit,
    sendWindow: { startHour, endHour, timezone },
    warmup: {
      enabled: contactCount > 200,
      startDaily: Math.min(50, dailyLimit),
      increment: 50,
      maxDaily: dailyLimit,
      currentDay: 1,
    },
    pauseOnBounceRate: 5,
    paused: false,
    estimatedDays: estimateDays(contactCount, dailyLimit),
    providerType: limits.type,
    stats: {
      sentToday: 0,
      sentThisHour: 0,
      lastResetDate: "",
      lastHourKey: "",
      totalQueued: contactCount,
      totalSent: 0,
      totalFailed: 0,
      totalInvalid: 0,
      startedAt: new Date().toISOString(),
    },
  };
}

export function parseAutopilotConfig(json: string | null): AutopilotConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as AutopilotConfig;
  } catch {
    return null;
  }
}

export async function launchAutopilotCampaign(
  input: AutopilotLaunchInput
): Promise<AutopilotLaunchResult> {
  const provider =
    (input.smtpProviderId
      ? await prisma.smtpProvider.findUnique({ where: { id: input.smtpProviderId } })
      : null) ||
    (await prisma.smtpProvider.findFirst({
      where: { isDefault: true, isActive: true },
    }));

  if (!provider) {
    throw new Error("No SMTP provider configured. Add SMTP in Settings first.");
  }

  const { valid, invalid } = verifyContactList(
    input.contacts.map((c) => ({ ...c, isValid: true }))
  );

  const duplicateCount = invalid.filter((c) => c.reason === "Duplicate").length;

  if (valid.length === 0) {
    throw new Error("No valid email addresses found in the list.");
  }

  const timezone = input.timezone || "Asia/Karachi";
  const config = createDefaultConfig(
    valid.length,
    provider.host,
    provider.name,
    timezone
  );
  config.stats.totalInvalid = invalid.length;

  // Upsert valid contacts
  const contactIds: string[] = [];
  for (const c of valid) {
    const contact = await prisma.contact.upsert({
      where: { email: c.email },
      update: {
        firstName: c.firstName || undefined,
        lastName: c.lastName || undefined,
        company: c.company || undefined,
        phone: c.phone || undefined,
        isValid: true,
        status: "ACTIVE",
      },
      create: {
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
        phone: c.phone,
        isValid: true,
        status: "ACTIVE",
      },
    });
    contactIds.push(contact.id);
  }

  // Mark invalid contacts
  for (const c of invalid) {
    await prisma.contact.upsert({
      where: { email: c.email },
      update: { isValid: false, status: "INVALID" },
      create: { email: c.email, isValid: false, status: "INVALID" },
    });
  }

  const list = await prisma.contactList.create({
    data: {
      name: `Autopilot: ${input.name}`,
      description: `Auto-created for ${valid.length} verified contacts`,
    },
  });

  for (const contactId of contactIds) {
    await prisma.listMember.create({
      data: { listId: list.id, contactId },
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      subject: input.subject,
      htmlContent: input.htmlContent,
      mode: "AUTOPILOT",
      autopilotConfig: JSON.stringify(config),
      status: "SENDING",
      listId: list.id,
      smtpProviderId: provider.id,
      createdById: input.createdById,
    },
  });

  await queueCampaignEmails(campaign.id);

  await logActivity({
    userId: input.createdById,
    action: "SCHEDULE",
    entityType: "autopilot",
    entityId: campaign.id,
    details: `Autopilot launched: ${valid.length} contacts, ~${config.estimatedDays} days, ${config.dailyLimit}/day limit`,
  });

  return {
    campaignId: campaign.id,
    listId: list.id,
    totalUploaded: input.contacts.length,
    validContacts: valid.length,
    invalidContacts: invalid.length,
    estimatedDays: config.estimatedDays,
    dailyLimit: config.dailyLimit,
    message:
      duplicateCount > 0
        ? `Campaign launched. ${valid.length} unique emails queued (${duplicateCount} duplicates skipped). Delivery over ~${config.estimatedDays} day(s) at ${config.dailyLimit}/day.`
        : `Campaign launched. ${valid.length} emails will be sent safely over ~${config.estimatedDays} day(s) at ${config.dailyLimit} emails/day.`,
  };
}

export async function checkBounceAndPause(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.mode !== "AUTOPILOT" || !campaign.autopilotConfig) return;

  const config = parseAutopilotConfig(campaign.autopilotConfig);
  if (!config || config.paused) return;

  const sent = await prisma.campaignEmail.count({
    where: { campaignId, status: { in: ["SENT", "DELIVERED", "OPENED", "CLICKED", "BOUNCED"] } },
  });
  const bounced = await prisma.campaignEmail.count({
    where: { campaignId, status: "BOUNCED" },
  });

  if (sent < 20) return; // need minimum sample

  const bounceRate = (bounced / sent) * 100;
  if (bounceRate >= config.pauseOnBounceRate) {
    config.paused = true;
    config.pauseReason = `Bounce rate ${bounceRate.toFixed(1)}% exceeded ${config.pauseOnBounceRate}% threshold`;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "PAUSED", autopilotConfig: JSON.stringify(config) },
    });
  }
}

export async function getAutopilotStatus(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { list: { include: { _count: { select: { members: true } } } } },
  });

  if (!campaign) throw new Error("Campaign not found");

  const config = parseAutopilotConfig(campaign.autopilotConfig);
  const stats = await prisma.campaignEmail.groupBy({
    by: ["status"],
    where: { campaignId },
    _count: true,
  });

  const statusMap: Record<string, number> = {};
  for (const s of stats) statusMap[s.status] = s._count;

  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const sent = (statusMap.SENT || 0) + (statusMap.DELIVERED || 0) + (statusMap.OPENED || 0) + (statusMap.CLICKED || 0);
  const queued = (statusMap.QUEUED || 0) + (statusMap.PENDING || 0);
  const failed = statusMap.FAILED || 0;
  const bounced = statusMap.BOUNCED || 0;

  const rateLimit = config ? checkRateLimit(config) : null;

  const lastFailed = await prisma.campaignEmail.findFirst({
    where: { campaignId, status: "FAILED" },
    orderBy: { updatedAt: "desc" },
    select: {
      errorMessage: true,
      contact: { select: { email: true } },
    },
  });

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      mode: campaign.mode,
    },
    autopilot: config,
    rateLimit: rateLimit
      ? {
          canSend: rateLimit.canSend,
          reason: rateLimit.reason,
          remainingToday: rateLimit.remainingToday,
        }
      : null,
    lastFailed: lastFailed
      ? { email: lastFailed.contact.email, error: lastFailed.errorMessage }
      : null,
    progress: {
      total,
      sent,
      queued,
      failed,
      bounced,
      percentComplete: total > 0 ? Math.round((sent / total) * 100) : 0,
    },
  };
}

/** Unblock a stuck autopilot campaign (24/7 window, unpaused) */
export async function unblockAutopilotCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign?.autopilotConfig) throw new Error("Not an autopilot campaign");

  const config = parseAutopilotConfig(campaign.autopilotConfig);
  if (!config) throw new Error("Invalid autopilot config");

  config.sendWindow = { startHour: 0, endHour: 24, timezone: config.sendWindow.timezone };
  config.paused = false;
  config.pauseReason = undefined;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "SENDING",
      autopilotConfig: JSON.stringify(config),
    },
  });

  const { processEmailQueue } = await import("../campaign-service");
  await processEmailQueue();

  return config;
}
