import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const email = await prisma.campaignEmail.findUnique({
      where: { trackingId: id },
    });

    if (email && !email.openedAt) {
      await prisma.campaignEmail.update({
        where: { id: email.id },
        data: { status: "OPENED", openedAt: new Date() },
      });

      await prisma.emailEvent.create({
        data: { campaignEmailId: email.id, type: "opened" },
      });
    }
  } catch {
    // Silent fail for tracking
  }

  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
