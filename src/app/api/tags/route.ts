import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: "asc" },
    });
    return apiSuccess(tags);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const body = await request.json();
    const tag = await prisma.tag.create({
      data: { name: body.name, color: body.color || "#6366f1" },
    });
    return apiSuccess(tag, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
