"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Send,
  MailOpen,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent } from "@/lib/utils";

interface Analytics {
  overview: {
    totalContacts: number;
    totalCampaigns: number;
    sentEmails: number;
    openedEmails: number;
    clickedEmails: number;
    bouncedEmails: number;
    unsubscribedContacts: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  chartData: { date: string; sent: number; opened: number; clicked: number }[];
  recentCampaigns: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    _count: { emails: number };
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics?days=14")
      .then((r) => r.json())
      .then((d) => d.success && setData(d.data));
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const { overview, chartData, recentCampaigns } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your email marketing performance</p>
        </div>
        <Link href="/campaigns/new">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Contacts" value={formatNumber(overview.totalContacts)} icon={Users} />
        <StatCard title="Emails Sent" value={formatNumber(overview.sentEmails)} icon={Send} />
        <StatCard
          title="Open Rate"
          value={formatPercent(overview.openedEmails, overview.sentEmails)}
          change={`${overview.openedEmails} opens`}
          icon={MailOpen}
          trend="up"
        />
        <StatCard
          title="Click Rate"
          value={formatPercent(overview.clickedEmails, overview.sentEmails)}
          change={`${overview.clickedEmails} clicks`}
          icon={MousePointerClick}
          trend="up"
        />
        <StatCard
          title="Bounce Rate"
          value={`${overview.bounceRate.toFixed(1)}%`}
          icon={AlertTriangle}
          trend={overview.bounceRate > 5 ? "down" : "neutral"}
        />
        <StatCard title="Unsubscribed" value={overview.unsubscribedContacts} icon={UserMinus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="hsl(239, 84%, 67%)" fill="url(#sentGrad)" name="Sent" />
                  <Area type="monotone" dataKey="opened" stroke="hsl(142, 76%, 36%)" fill="url(#openGrad)" name="Opened" />
                  <Area type="monotone" dataKey="clicked" stroke="hsl(38, 92%, 50%)" fill="none" name="Clicked" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaigns yet</p>
            ) : (
              recentCampaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                    <div>
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign._count.emails} recipients
                      </p>
                    </div>
                    <Badge variant={campaign.status === "SENT" ? "success" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
