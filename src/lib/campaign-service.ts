import type { SmtpProvider, CampaignMode } from "@prisma/client";
import { prisma } from "./prisma";
import { personalizeContent } from "./personalization";
import { sendEmail, getTransporter, isLoginRateLimitError, clearTransporterCache } from "./smtp";
import { logActivity } from "./activity";
import { createNotification } from "./notifications";
import {
  parseAutopilotConfig,
  checkBounceAndPause,
} from "./autopilot/engine";
import { checkRateLimit, recordSend } from "./autopilot/rate-limiter";
import { getProviderLimits } from "./autopilot/provider-limits";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BATCH_SIZE = 5;

export async function queueCampaignEmails(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      list: { include: { members: { include: { contact: true } } } },
      segment: { include: { members: { include: { contact: true } } } },
    },
  });

  if (!campaign) throw new Error("Campaign not found");

  let contacts =
    campaign.list?.members.map((m) => m.contact) ||
    campaign.segment?.members.map((m) => m.contact) ||
    [];

  contacts = contacts.filter((c) => c.status === "ACTIVE" && c.isValid);

  if (contacts.length === 0) {
    throw new Error("No valid recipients found");
  }

  for (const contact of contacts) {
    const existing = await prisma.campaignEmail.findFirst({
      where: { campaignId, contactId: contact.id },
    });
    if (!existing) {
      await prisma.campaignEmail.create({
        data: { campaignId, contactId: contact.id, status: "QUEUED" },
      });
    }
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" },
  });

  return contacts.length;
}

type EmailWithRelations = {
  id: string;
  trackingId: string;
  retryCount: number;
  maxRetries: number;
  contact: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    company: string | null;
    phone: string | null;
    customFields: string | null;
  };
  campaign: {
    id: string;
    subject: string;
    htmlContent: string;
    mode: CampaignMode;
    autopilotConfig: string | null;
    smtpProvider: SmtpProvider | null;
    createdBy: { id: string };
  };
};

async function canSendAutopilotEmail(
  campaign: EmailWithRelations["campaign"]
): Promise<{ allowed: boolean; reason?: string }> {
  if (campaign.mode !== "AUTOPILOT" || !campaign.autopilotConfig) {
    return { allowed: true };
  }

  const config = parseAutopilotConfig(campaign.autopilotConfig);
  if (!config) return { allowed: true };

  const result = checkRateLimit(config);
  if (!result.canSend) {
    // Persist updated stats even when blocked
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { autopilotConfig: JSON.stringify(result.config) },
    });
    return { allowed: false, reason: result.reason };
  }

  return { allowed: true };
}

async function recordAutopilotSend(campaignId: string, autopilotConfig: string) {
  const config = parseAutopilotConfig(autopilotConfig);
  if (!config) return;

  const updated = recordSend(config);
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { autopilotConfig: JSON.stringify(updated) },
  });
}

export async function processEmailQueue() {
  const now = new Date();

  const queued = await prisma.campaignEmail.findMany({
    where: { status: "QUEUED" },
    take: BATCH_SIZE * 3,
    include: {
      contact: true,
      campaign: { include: { smtpProvider: true, createdBy: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const retries = await prisma.campaignEmail.findMany({
    where: {
      status: "FAILED",
      retryCount: { lt: 3 },
      OR: [{ nextRetryAt: { lte: now } }, { nextRetryAt: null }],
    },
    take: BATCH_SIZE,
    include: {
      contact: true,
      campaign: { include: { smtpProvider: true, createdBy: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const toProcess: EmailWithRelations[] = [];

  for (const email of queued) {
    if (toProcess.length >= BATCH_SIZE) break;
    const check = await canSendAutopilotEmail(email.campaign);
    if (check.allowed) {
      toProcess.push(email as EmailWithRelations);
    }
  }

  for (const email of retries) {
    if (toProcess.length >= BATCH_SIZE) break;
    toProcess.push(email as EmailWithRelations);
  }

  const transporterByProvider = new Map<string, ReturnType<typeof getTransporter>>();

  for (const email of toProcess) {
    const provider =
      email.campaign.smtpProvider ||
      (await prisma.smtpProvider.findFirst({
        where: { isDefault: true, isActive: true },
      }));

    if (!provider) continue;

    const limits = getProviderLimits(provider.host, provider.name);
    if (!transporterByProvider.has(provider.id)) {
      transporterByProvider.set(provider.id, getTransporter(provider));
    }

    const result = await processSingleEmail(
      email,
      transporterByProvider.get(provider.id)!
    );

    if (result.loginRateLimited) {
      await pauseCampaignForLoginLimit(email.campaign.id, email.campaign.autopilotConfig);
      break;
    }

    if (email.campaign.mode === "AUTOPILOT" && email.campaign.autopilotConfig) {
      await recordAutopilotSend(email.campaign.id, email.campaign.autopilotConfig);
      await checkBounceAndPause(email.campaign.id);
    }

    if (limits.minDelayMs > 0) {
      await new Promise((r) => setTimeout(r, limits.minDelayMs));
    }
  }

  await updateCampaignStatuses();
}

async function pauseCampaignForLoginLimit(
  campaignId: string,
  autopilotConfig: string | null
) {
  clearTransporterCache();
  const resumeAt = new Date(Date.now() + 30 * 60_000);

  if (autopilotConfig) {
    const config = parseAutopilotConfig(autopilotConfig);
    if (config) {
      config.paused = true;
      config.pauseReason =
        "Gmail login limit reached — auto-resumes in 30 minutes. Wait before retrying.";
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "PAUSED", autopilotConfig: JSON.stringify(config) },
      });
      return;
    }
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "PAUSED" },
  });

  await prisma.campaignEmail.updateMany({
    where: { campaignId, status: "QUEUED" },
    data: { nextRetryAt: resumeAt },
  });
}

async function processSingleEmail(
  email: EmailWithRelations,
  transporter: ReturnType<typeof getTransporter>
): Promise<{ loginRateLimited: boolean }> {
  const provider =
    email.campaign.smtpProvider ||
    (await prisma.smtpProvider.findFirst({
      where: { isDefault: true, isActive: true },
    }));

  if (!provider) {
    await prisma.campaignEmail.update({
      where: { id: email.id },
      data: { status: "FAILED", errorMessage: "No SMTP provider configured" },
    });
    return { loginRateLimited: false };
  }

  await prisma.campaignEmail.update({
    where: { id: email.id },
    data: { status: "SENDING" },
  });

  try {
    const personalizeExtras = {
      trackingId: email.trackingId,
      appUrl: APP_URL,
    };
    const personalizedHtml = personalizeContent(
      email.campaign.htmlContent,
      email.contact,
      personalizeExtras
    );
    const personalizedSubject = personalizeContent(
      email.campaign.subject,
      email.contact,
      personalizeExtras
    );

    await sendEmail({
      provider,
      to: email.contact.email,
      subject: personalizedSubject,
      html: personalizedHtml,
      trackingId: email.trackingId,
      appUrl: APP_URL,
      transporter,
    });

    await prisma.campaignEmail.update({
      where: { id: email.id },
      data: { status: "SENT", sentAt: new Date(), deliveredAt: new Date() },
    });

    await prisma.emailEvent.create({
      data: { campaignEmailId: email.id, type: "sent" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Send failed";
    const loginLimited = isLoginRateLimitError(errorMessage);

    if (loginLimited) {
      await prisma.campaignEmail.update({
        where: { id: email.id },
        data: {
          status: "QUEUED",
          errorMessage: "Gmail login limit — will retry in 30 min",
          nextRetryAt: new Date(Date.now() + 30 * 60_000),
        },
      });
      return { loginRateLimited: true };
    }

    const retryCount = email.retryCount + 1;
    const shouldRetry = retryCount < email.maxRetries;

    await prisma.campaignEmail.update({
      where: { id: email.id },
      data: {
        status: "FAILED",
        retryCount,
        errorMessage,
        nextRetryAt: shouldRetry
          ? new Date(Date.now() + Math.pow(2, retryCount) * 60_000)
          : null,
      },
    });

    if (!shouldRetry) {
      await createNotification({
        userId: email.campaign.createdBy.id,
        title: "Email delivery failed",
        message: `Failed to send to ${email.contact.email} after ${email.maxRetries} retries`,
        type: "error",
      });
    }
    return { loginRateLimited: false };
  }

  return { loginRateLimited: false };
}

async function updateCampaignStatuses() {
  const sendingCampaigns = await prisma.campaign.findMany({
    where: { status: "SENDING" },
    include: { emails: { select: { status: true } } },
  });

  for (const campaign of sendingCampaigns) {
    const pending = campaign.emails.filter(
      (e) =>
        e.status === "QUEUED" ||
        e.status === "PENDING" ||
        e.status === "SENDING"
    );

    if (pending.length === 0) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "SENT", sentAt: new Date() },
      });

      await logActivity({
        action: "SEND",
        entityType: "campaign",
        entityId: campaign.id,
        details: `Campaign "${campaign.name}" completed`,
      });
    }
  }

  const scheduled = await prisma.campaign.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
  });

  for (const campaign of scheduled) {
    await queueCampaignEmails(campaign.id);
  }
}

export async function getCampaignStats(campaignId: string) {
  const total = await prisma.campaignEmail.count({ where: { campaignId } });
  const sent = await prisma.campaignEmail.count({
    where: {
      campaignId,
      status: { in: ["SENT", "DELIVERED", "OPENED", "CLICKED"] },
    },
  });
  const opened = await prisma.campaignEmail.count({
    where: { campaignId, openedAt: { not: null } },
  });
  const clicked = await prisma.campaignEmail.count({
    where: { campaignId, clickedAt: { not: null } },
  });
  const bounced = await prisma.campaignEmail.count({
    where: { campaignId, status: "BOUNCED" },
  });
  const failed = await prisma.campaignEmail.count({
    where: { campaignId, status: "FAILED" },
  });
  const unsubscribed = await prisma.campaignEmail.count({
    where: { campaignId, status: "UNSUBSCRIBED" },
  });

  return { total, sent, delivered: sent, opened, clicked, bounced, failed, unsubscribed };
}
