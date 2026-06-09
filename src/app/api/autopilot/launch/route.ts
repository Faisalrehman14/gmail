import { requireRole } from "@/lib/auth";
import { parseFile } from "@/lib/import";
import { launchAutopilotCampaign } from "@/lib/autopilot/engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const contentType = request.headers.get("content-type") || "";

    let name: string;
    let subject: string;
    let htmlContent: string;
    let timezone: string | undefined;
    let contacts: {
      email: string;
      firstName?: string;
      lastName?: string;
      company?: string;
      phone?: string;
    }[];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      name = formData.get("name") as string;
      subject = formData.get("subject") as string;
      htmlContent = formData.get("htmlContent") as string;
      timezone = (formData.get("timezone") as string) || undefined;

      if (!file || !name || !subject || !htmlContent) {
        return apiError("File, name, subject, and email content are required");
      }

      const buffer = await file.arrayBuffer();
      const content =
        file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
          ? buffer
          : await file.text();

      const imported = parseFile(file.name, content);
      contacts = imported.map((c) => ({
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
        phone: c.phone,
      }));
    } else {
      const body = await request.json();
      name = body.name;
      subject = body.subject;
      htmlContent = body.htmlContent;
      timezone = body.timezone;
      contacts = body.contacts;

      if (!name || !subject || !htmlContent || !contacts?.length) {
        return apiError("Name, subject, content, and contacts are required");
      }
    }

    const result = await launchAutopilotCampaign({
      name,
      subject,
      htmlContent,
      contacts,
      timezone,
      createdById: session.id,
    });

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
