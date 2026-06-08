import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { testSmtpConnection } from "@/lib/smtp";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const providers = await prisma.smtpProvider.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        fromEmail: true,
        fromName: true,
        isDefault: true,
        isActive: true,
        createdAt: true,
      },
    });
    return apiSuccess(providers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("ADMIN");
    const body = await request.json();

    if (body.isDefault) {
      await prisma.smtpProvider.updateMany({
        data: { isDefault: false },
      });
    }

    const provider = await prisma.smtpProvider.create({
      data: {
        name: body.name,
        host: body.host,
        port: body.port || 587,
        secure: body.secure || false,
        username: body.username,
        password: body.password,
        fromEmail: body.fromEmail,
        fromName: body.fromName,
        isDefault: body.isDefault || false,
        isActive: true,
      },
    });

    return apiSuccess(
      {
        id: provider.id,
        name: provider.name,
        host: provider.host,
        port: provider.port,
        fromEmail: provider.fromEmail,
        isDefault: provider.isDefault,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
