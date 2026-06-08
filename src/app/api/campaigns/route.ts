import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { queueCampaignEmails } from "@/lib/campaign-service";
import { logActivity } from "@/lib/activity";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const campaigns = await prisma.campaign.findMany({
      include: {
        list: { select: { name: true } },
        segment: { select: { name: true } },
        createdBy: { select: { name: true } },
        _count: { select: { emails: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(campaigns);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const body = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        subject: body.subject,
        htmlContent: body.htmlContent || "<p>Hello {{first_name}},</p>",
        status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        listId: body.listId || null,
        segmentId: body.segmentId || null,
        templateId: body.templateId || null,
        smtpProviderId: body.smtpProviderId || null,
        createdById: session.id,
      },
    });

    await logActivity({
      userId: session.id,
      action: "CREATE",
      entityType: "campaign",
      entityId: campaign.id,
      details: `Created campaign "${campaign.name}"`,
    });

    if (body.sendNow) {
      await queueCampaignEmails(campaign.id);
    }

    return apiSuccess(campaign, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
