import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { testSmtpConnection } from "@/lib/smtp";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const provider = await prisma.smtpProvider.findUnique({ where: { id } });
    if (!provider) return apiError("Provider not found", 404);

    await testSmtpConnection(provider);
    return apiSuccess({ connected: true });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Connection failed",
      400
    );
  }
}
