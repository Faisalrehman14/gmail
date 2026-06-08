import { requireRole } from "@/lib/auth";
import { queueCampaignEmails } from "@/lib/campaign-service";
import { logActivity } from "@/lib/activity";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const count = await queueCampaignEmails(id);

    await logActivity({
      userId: session.id,
      action: "SEND",
      entityType: "campaign",
      entityId: id,
      details: `Queued ${count} emails`,
    });

    return apiSuccess({ queued: count });
  } catch (error) {
    return handleApiError(error);
  }
}
