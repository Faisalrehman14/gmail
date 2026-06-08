import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const templates = await prisma.emailTemplate.findMany({
      include: { createdBy: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return apiSuccess(templates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const body = await request.json();

    const template = await prisma.emailTemplate.create({
      data: {
        name: body.name,
        subject: body.subject,
        htmlContent: body.htmlContent,
        jsonDesign: body.jsonDesign,
        createdById: session.id,
      },
    });

    await logActivity({
      userId: session.id,
      action: "CREATE",
      entityType: "template",
      entityId: template.id,
    });

    return apiSuccess(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
