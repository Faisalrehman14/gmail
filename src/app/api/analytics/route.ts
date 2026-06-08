import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      totalContacts,
      totalCampaigns,
      sentEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      unsubscribedContacts,
      recentCampaigns,
      dailyStats,
    ] = await Promise.all([
      prisma.contact.count({ where: { status: "ACTIVE" } }),
      prisma.campaign.count(),
      prisma.campaignEmail.count({
        where: { sentAt: { gte: since }, status: { not: "FAILED" } },
      }),
      prisma.campaignEmail.count({
        where: { openedAt: { gte: since } },
      }),
      prisma.campaignEmail.count({
        where: { clickedAt: { gte: since } },
      }),
      prisma.campaignEmail.count({
        where: { bouncedAt: { gte: since } },
      }),
      prisma.contact.count({ where: { status: "UNSUBSCRIBED" } }),
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { emails: true } } },
      }),
      prisma.campaignEmail.findMany({
        where: { sentAt: { gte: since } },
        select: { sentAt: true, openedAt: true, clickedAt: true },
      }),
    ]);

    const dailyMap = new Map<
      string,
      { sent: number; opened: number; clicked: number }
    >();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap.set(key, { sent: 0, opened: 0, clicked: 0 });
    }

    for (const email of dailyStats) {
      if (email.sentAt) {
        const key = email.sentAt.toISOString().split("T")[0];
        const entry = dailyMap.get(key);
        if (entry) entry.sent++;
      }
      if (email.openedAt) {
        const key = email.openedAt.toISOString().split("T")[0];
        const entry = dailyMap.get(key);
        if (entry) entry.opened++;
      }
      if (email.clickedAt) {
        const key = email.clickedAt.toISOString().split("T")[0];
        const entry = dailyMap.get(key);
        if (entry) entry.clicked++;
      }
    }

    const chartData = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .reverse();

    return apiSuccess({
      overview: {
        totalContacts,
        totalCampaigns,
        sentEmails,
        openedEmails,
        clickedEmails,
        bouncedEmails,
        unsubscribedContacts,
        openRate: sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0,
        clickRate: sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0,
        bounceRate: sentEmails > 0 ? (bouncedEmails / sentEmails) * 100 : 0,
      },
      chartData,
      recentCampaigns,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
