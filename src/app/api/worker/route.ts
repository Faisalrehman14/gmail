import { processEmailQueue } from "@/lib/campaign-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    await processEmailQueue();
    return apiSuccess({ processed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
