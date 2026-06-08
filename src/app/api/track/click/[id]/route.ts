import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const email = await prisma.campaignEmail.findUnique({
      where: { trackingId: id },
    });

    if (email) {
      await prisma.campaignEmail.update({
        where: { id: email.id },
        data: {
          status: "CLICKED",
          clickedAt: email.clickedAt || new Date(),
        },
      });

      await prisma.emailEvent.create({
        data: {
          campaignEmailId: email.id,
          type: "clicked",
          metadata: JSON.stringify({ url }),
        },
      });
    }
  } catch {
    // Silent fail for tracking
  }

  return NextResponse.redirect(url);
}
