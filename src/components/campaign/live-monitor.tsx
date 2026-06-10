"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Clock,
  Gauge,
  Loader2,
  Mail,
  Radio,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";

interface LiveData {
  updatedAt: string;
  campaign: { status: string };
  sender: { name: string; email: string; isGmail: boolean } | null;
  summary: {
    total: number;
    sent: number;
    queued: number;
    sending: number;
    failed: number;
    percentComplete: number;
    gmailRecipients: number;
    otherRecipients: number;
  };
  speed: {
    emailsPerMinute: number;
    delayBetweenSendsMs: number;
    eta: string | null;
  };
  currentlySending: { email: string; name: string | null }[];
  recentActivity: {
    email: string;
    name: string | null;
    status: string;
    isGmail: boolean;
    sentAt: string | null;
    error: string | null;
  }[];
  recipients: {
    id: string;
    email: string;
    name: string | null;
    status: string;
    isGmail: boolean;
    sentAt: string | null;
    error: string | null;
  }[];
  autopilot: {
    canSend: boolean;
    blockReason?: string;
    paused?: boolean;
    pauseReason?: string;
    sentToday?: number;
    dailyLimit?: number;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  SENT: "bg-green-500/15 text-green-700 dark:text-green-400",
  DELIVERED: "bg-green-500/15 text-green-700 dark:text-green-400",
  OPENED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  CLICKED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  QUEUED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  SENDING: "bg-primary/15 text-primary",
  FAILED: "bg-destructive/15 text-destructive",
  BOUNCED: "bg-destructive/15 text-destructive",
};

function statusBadge(status: string) {
  return (
    <Badge variant="secondary" className={STATUS_COLORS[status] || ""}>
      {status}
    </Badge>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString();
}

export function LiveMonitor({ campaignId, isActive }: { campaignId: string; isActive: boolean }) {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLive = useCallback(async () => {
    const liveRes = await fetch(`/api/campaigns/${campaignId}/live`);
    const json = await liveRes.json();
    if (json.success) {
      setData(json.data);
    }
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    fetchLive();
    if (!isActive) return;
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, [fetchLive, isActive]);

  if (loading && !data) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className={`h-5 w-5 ${isActive ? "animate-pulse text-green-600" : "text-muted-foreground"}`} />
            Live Monitor
            {isActive && (
              <Badge variant="secondary" className="ml-2 bg-green-500/15 text-green-700">
                LIVE · updates every 3s
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.sender && (
            <p className="text-sm text-muted-foreground">
              Sending from: <strong>{data.sender.name}</strong> &lt;{data.sender.email}&gt;
              {data.sender.isGmail && (
                <Badge variant="outline" className="ml-2 text-xs">Gmail SMTP</Badge>
              )}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Gmail Recipients"
              value={data.summary.gmailRecipients}
              icon={Mail}
            />
            <StatCard
              title="Other Domains"
              value={data.summary.otherRecipients}
              icon={Users}
            />
            <StatCard
              title="Speed"
              value={`${data.speed.emailsPerMinute}/min`}
              icon={Gauge}
            />
            <StatCard
              title="Est. Remaining"
              value={data.speed.eta || "—"}
              icon={Clock}
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>{data.summary.sent} of {data.summary.total} delivered</span>
              <span className="font-medium">{data.summary.percentComplete}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-600 transition-all duration-500"
                style={{ width: `${data.summary.percentComplete}%` }}
              />
            </div>
          </div>

          {data.autopilot?.paused && data.autopilot.pauseReason && (
            <p className="text-sm text-destructive">
              Paused: {data.autopilot.pauseReason}
            </p>
          )}
          {data.autopilot && !data.autopilot.canSend && data.autopilot.blockReason && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⏸ {data.autopilot.blockReason}
            </p>
          )}

          {data.currentlySending.length > 0 && (
            <div className="rounded-lg border bg-background p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending now
              </p>
              {data.currentlySending.map((r) => (
                <p key={r.email} className="font-mono text-sm">{r.email}</p>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Delay between sends: {(data.speed.delayBetweenSendsMs / 1000).toFixed(0)}s
            {data.autopilot?.dailyLimit != null && (
              <> · Today: {data.autopilot.sentToday}/{data.autopilot.dailyLimit}</>
            )}
            · Last update: {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto">
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            <ul className="space-y-2">
              {data.recentActivity.map((item, i) => (
                <li
                  key={`${item.email}-${i}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-sm last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-mono">{item.email}</span>
                    {item.isGmail && (
                      <Badge variant="outline" className="ml-2 text-[10px]">Gmail</Badge>
                    )}
                    {item.error && (
                      <p className="text-xs text-destructive">{item.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(item.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(item.sentAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Recipients ({data.recipients.length})</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Recipient</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Sent at</th>
              </tr>
            </thead>
            <tbody>
              {data.recipients.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">
                    <div className="font-mono text-xs sm:text-sm">{r.email}</div>
                    {r.isGmail && (
                      <Badge variant="outline" className="mt-1 text-[10px]">Gmail</Badge>
                    )}
                  </td>
                  <td className="py-2">{statusBadge(r.status)}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {formatTime(r.sentAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
