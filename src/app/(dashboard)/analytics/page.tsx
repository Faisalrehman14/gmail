"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Send, MailOpen, MousePointerClick } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";

const PIE_COLORS = ["hsl(239, 84%, 67%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(215, 20%, 65%)"];

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    overview: Record<string, number>;
    chartData: { date: string; sent: number; opened: number; clicked: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics?days=30")
      .then((r) => r.json())
      .then((d) => d.success && setData(d.data));
  }, []);

  if (!data) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const { overview, chartData } = data;

  const pieData = [
    { name: "Opened", value: overview.openedEmails },
    { name: "Clicked", value: overview.clickedEmails },
    { name: "Bounced", value: overview.bouncedEmails },
    { name: "Unsubscribed", value: overview.unsubscribedContacts },
    {
      name: "No Action",
      value: Math.max(0, overview.sentEmails - overview.openedEmails - overview.bouncedEmails),
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Campaign performance and engagement metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contacts" value={formatNumber(overview.totalContacts)} icon={Users} />
        <StatCard title="Emails Sent" value={formatNumber(overview.sentEmails)} icon={Send} />
        <StatCard title="Open Rate" value={`${overview.openRate.toFixed(1)}%`} icon={MailOpen} trend="up" />
        <StatCard title="Click Rate" value={`${overview.clickRate.toFixed(1)}%`} icon={MousePointerClick} trend="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>30-Day Email Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="sent" fill="hsl(239, 84%, 67%)" name="Sent" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="opened" fill="hsl(142, 76%, 36%)" name="Opened" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicked" fill="hsl(38, 92%, 50%)" name="Clicked" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Engagement Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No data yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{formatPercent(overview.openedEmails, overview.sentEmails)}</p>
              <p className="text-sm text-muted-foreground">Average Open Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{formatPercent(overview.clickedEmails, overview.sentEmails)}</p>
              <p className="text-sm text-muted-foreground">Average Click Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{overview.bounceRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
