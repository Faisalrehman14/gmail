import { processEmailQueue } from "@/lib/campaign-service";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    await requireAuth();
    await processEmailQueue();
    return apiSuccess({ processed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
