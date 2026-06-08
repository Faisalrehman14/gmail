import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validateEmail } from "@/lib/email-validation";
import { logActivity } from "@/lib/activity";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const tag = searchParams.get("tag") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const where: Prisma.ContactWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { company: { contains: search } },
      ];
    }

    if (status) where.status = status as Prisma.EnumContactStatusFilter["equals"];
    if (tag) where.tags = { some: { tag: { name: tag } } };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return apiSuccess({
      contacts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validation = validateEmail(body.email);

    if (!validation.isValid) {
      return apiError(`Invalid email: ${validation.reason}`);
    }

    const contact = await prisma.contact.create({
      data: {
        email: validation.email,
        firstName: body.firstName,
        lastName: body.lastName,
        company: body.company,
        phone: body.phone,
        isValid: true,
        customFields: body.customFields
          ? JSON.stringify(body.customFields)
          : null,
      },
      include: { tags: { include: { tag: true } } },
    });

    await logActivity({
      userId: session.id,
      action: "CREATE",
      entityType: "contact",
      entityId: contact.id,
    });

    return apiSuccess(contact, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
