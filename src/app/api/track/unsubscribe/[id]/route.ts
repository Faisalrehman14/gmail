import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const email = await prisma.campaignEmail.findUnique({
      where: { trackingId: id },
      include: { contact: true },
    });

    if (email) {
      await prisma.campaignEmail.update({
        where: { id: email.id },
        data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
      });

      await prisma.contact.update({
        where: { id: email.contactId },
        data: { status: "UNSUBSCRIBED" },
      });

      await prisma.emailEvent.create({
        data: { campaignEmailId: email.id, type: "unsubscribed" },
      });
    }
  } catch {
    // Silent fail
  }

  const html = `<!DOCTYPE html>
<html><head><title>Unsubscribed</title>
<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}
.card{background:white;padding:3rem;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center;max-width:400px}
h1{color:#1e293b;margin:0 0 .5rem}p{color:#64748b}</style></head>
<body><div class="card"><h1>Unsubscribed</h1><p>You have been successfully removed from our mailing list.</p></div></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
