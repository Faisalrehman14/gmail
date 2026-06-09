import { requireRole } from "@/lib/auth";
import { unblockAutopilotCampaign } from "@/lib/autopilot/engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    await unblockAutopilotCampaign(id);
    return apiSuccess({ message: "Queue processed — check campaign status" });
  } catch (error) {
    return handleApiError(error);
  }
}
