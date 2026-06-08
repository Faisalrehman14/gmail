import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const lists = await prisma.contactList.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(lists);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const body = await request.json();

    const list = await prisma.contactList.create({
      data: { name: body.name, description: body.description },
    });

    await logActivity({
      userId: session.id,
      action: "CREATE",
      entityType: "list",
      entityId: list.id,
    });

    return apiSuccess(list, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
