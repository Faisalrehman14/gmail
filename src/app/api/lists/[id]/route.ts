import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const list = await prisma.contactList.findUnique({
      where: { id },
      include: {
        members: {
          include: { contact: { include: { tags: { include: { tag: true } } } } },
          take: 100,
        },
        _count: { select: { members: true } },
      },
    });
    if (!list) return apiError("List not found", 404);
    return apiSuccess(list);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    await prisma.contactList.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
