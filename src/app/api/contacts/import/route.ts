import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { parseFile } from "@/lib/import";
import { logActivity } from "@/lib/activity";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const listId = formData.get("listId") as string | null;

    if (!file) return apiError("No file provided");

    const buffer = await file.arrayBuffer();
    const content =
      file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
        ? buffer
        : await file.text();

    const imported = parseFile(file.name, content);

    let created = 0;
    let updated = 0;
    let invalid = 0;

    for (const row of imported) {
      if (!row.isValid) {
        invalid++;
        continue;
      }

      const existing = await prisma.contact.findUnique({
        where: { email: row.email },
      });

      if (existing) {
        await prisma.contact.update({
          where: { email: row.email },
          data: {
            firstName: row.firstName || existing.firstName,
            lastName: row.lastName || existing.lastName,
            company: row.company || existing.company,
            phone: row.phone || existing.phone,
            isValid: true,
          },
        });
        updated++;

        if (listId) {
          await prisma.listMember.upsert({
            where: {
              listId_contactId: { listId, contactId: existing.id },
            },
            create: { listId, contactId: existing.id },
            update: {},
          });
        }
      } else {
        const contact = await prisma.contact.create({
          data: {
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            company: row.company,
            phone: row.phone,
            isValid: true,
            customFields: row.customFields
              ? JSON.stringify(row.customFields)
              : null,
          },
        });
        created++;

        if (listId) {
          await prisma.listMember.create({
            data: { listId, contactId: contact.id },
          });
        }
      }
    }

    await logActivity({
      userId: session.id,
      action: "IMPORT",
      entityType: "contact",
      details: `Imported ${created} new, ${updated} updated, ${invalid} invalid from ${file.name}`,
    });

    return apiSuccess({ created, updated, invalid, total: imported.length });
  } catch (error) {
    return handleApiError(error);
  }
}
