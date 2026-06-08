import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { getCampaignStats, queueCampaignEmails } from "@/lib/campaign-service";
import { logActivity } from "@/lib/activity";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        list: true,
        segment: true,
        template: true,
        smtpProvider: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
      },
    });

    if (!campaign) return apiError("Campaign not found", 404);

    const stats = await getCampaignStats(id);
    return apiSuccess({ ...campaign, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const body = await request.json();

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: body.name,
        subject: body.subject,
        htmlContent: body.htmlContent,
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        listId: body.listId,
        segmentId: body.segmentId,
        smtpProviderId: body.smtpProviderId,
      },
    });

    await logActivity({
      userId: session.id,
      action: "UPDATE",
      entityType: "campaign",
      entityId: id,
    });

    return apiSuccess(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    await prisma.campaign.delete({ where: { id } });

    await logActivity({
      userId: session.id,
      action: "DELETE",
      entityType: "campaign",
      entityId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
