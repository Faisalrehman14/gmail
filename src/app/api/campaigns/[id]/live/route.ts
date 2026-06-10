import { requireAuth } from "@/lib/auth";
import { getCampaignLiveMonitor } from "@/lib/campaign-monitor";
import { processEmailQueue } from "@/lib/campaign-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const data = await getCampaignLiveMonitor(id);

    if (data.campaign.status === "SENDING" && data.summary.queued > 0) {
      processEmailQueue().catch(console.error);
    }

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
