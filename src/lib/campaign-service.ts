import type { SmtpProvider } from "@prisma/client";
import { prisma } from "./prisma";
import { personalizeContent } from "./personalization";
import { sendEmail } from "./smtp";
import { logActivity } from "./activity";
import { createNotification } from "./notifications";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BATCH_SIZE = 10;

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

export async function processEmailQueue() {
  const now = new Date();

  const queued = await prisma.campaignEmail.findMany({
    where: { status: "QUEUED" },
    take: BATCH_SIZE,
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

  const pendingEmails = [...queued, ...retries].slice(0, BATCH_SIZE);

  for (const email of pendingEmails) {
    await processSingleEmail(email);
  }

  await updateCampaignStatuses();
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
    smtpProvider: SmtpProvider | null;
    createdBy: { id: string };
  };
};

async function processSingleEmail(email: EmailWithRelations) {
  const provider =
    email.campaign.smtpProvider ||
    (await prisma.smtpProvider.findFirst({
      where: { isDefault: true, isActive: true },
    }));

  if (!provider) {
    await prisma.campaignEmail.update({
      where: { id: email.id },
      data: {
        status: "FAILED",
        errorMessage: "No SMTP provider configured",
      },
    });
    return;
  }

  await prisma.campaignEmail.update({
    where: { id: email.id },
    data: { status: "SENDING" },
  });

  try {
    const personalizedHtml = personalizeContent(
      email.campaign.htmlContent,
      email.contact
    );
    const personalizedSubject = personalizeContent(
      email.campaign.subject,
      email.contact
    );

    const unsubscribeLink = `${APP_URL}/api/track/unsubscribe/${email.trackingId}`;
    const htmlWithUnsub = personalizedHtml.includes("</body>")
      ? personalizedHtml.replace(
          "</body>",
          `<p style="font-size:12px;color:#999;text-align:center"><a href="${unsubscribeLink}">Unsubscribe</a></p></body>`
        )
      : personalizedHtml +
        `<p style="font-size:12px;color:#999;text-align:center"><a href="${unsubscribeLink}">Unsubscribe</a></p>`;

    await sendEmail({
      provider,
      to: email.contact.email,
      subject: personalizedSubject,
      html: htmlWithUnsub,
      trackingId: email.trackingId,
      appUrl: APP_URL,
    });

    await prisma.campaignEmail.update({
      where: { id: email.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    await prisma.emailEvent.create({
      data: { campaignEmailId: email.id, type: "sent" },
    });
  } catch (error) {
    const retryCount = email.retryCount + 1;
    const shouldRetry = retryCount < email.maxRetries;

    await prisma.campaignEmail.update({
      where: { id: email.id },
      data: {
        status: "FAILED",
        retryCount,
        errorMessage: error instanceof Error ? error.message : "Send failed",
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
  }
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
