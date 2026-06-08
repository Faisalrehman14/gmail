import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const segments = await prisma.segment.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(segments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const body = await request.json();

    const segment = await prisma.segment.create({
      data: {
        name: body.name,
        description: body.description,
        filters: JSON.stringify(body.filters || {}),
      },
    });

    if (body.contactIds?.length) {
      await prisma.segmentMember.createMany({
        data: body.contactIds.map((contactId: string) => ({
          segmentId: segment.id,
          contactId,
        })),
      });
    }

    return apiSuccess(segment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
