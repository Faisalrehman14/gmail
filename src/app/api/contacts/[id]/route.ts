import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });
    if (!contact) return apiError("Contact not found", 404);
    return apiSuccess(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const body = await request.json();

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        company: body.company,
        phone: body.phone,
        status: body.status,
        customFields: body.customFields
          ? JSON.stringify(body.customFields)
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });

    await logActivity({
      userId: session.id,
      action: "UPDATE",
      entityType: "contact",
      entityId: id,
    });

    return apiSuccess(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    await prisma.contact.delete({ where: { id } });

    await logActivity({
      userId: session.id,
      action: "DELETE",
      entityType: "contact",
      entityId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
