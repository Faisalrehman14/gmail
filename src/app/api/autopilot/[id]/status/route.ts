import { requireAuth } from "@/lib/auth";
import { getAutopilotStatus } from "@/lib/autopilot/engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const { prisma } = await import("@/lib/prisma");
    const campaign = await prisma.campaign.findUnique({ where: { id }, select: { mode: true } });
    if (!campaign || campaign.mode !== "AUTOPILOT") {
      return apiSuccess({ autopilot: null, progress: null });
    }

    const status = await getAutopilotStatus(id);
    return apiSuccess(status);
  } catch (error) {
    return handleApiError(error);
  }
}
