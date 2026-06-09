import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { sendTestEmail } from "@/lib/smtp";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const body = await request.json();
    const to = body.to || session.email;

    const provider = await prisma.smtpProvider.findUnique({ where: { id } });
    if (!provider) return apiError("Provider not found", 404);
    if (!provider.isActive) return apiError("Provider is inactive", 400);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    await sendTestEmail({ provider, to, appUrl });

    return apiSuccess({ sent: true, to });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to send test email",
      400
    );
  }
}
