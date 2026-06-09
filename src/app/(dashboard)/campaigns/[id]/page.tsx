"use client";

import { useEffect, useState, use, useCallback } from "react";
import { Send, Loader2, Rocket, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { MailOpen, MousePointerClick, AlertTriangle, UserMinus, Send as SendIcon } from "lucide-react";
import { formatPercent } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AutopilotStatus {
  autopilot: {
    dailyLimit: number;
    hourlyLimit: number;
    estimatedDays: number;
    paused: boolean;
    pauseReason?: string;
    warmup: { enabled: boolean; currentDay: number };
    stats: { sentToday: number; totalSent: number; totalInvalid: number };
    sendWindow: { startHour: number; endHour: number; timezone: string };
  };
  rateLimit?: { canSend: boolean; reason?: string; remainingToday: number } | null;
  lastFailed?: { email: string; error: string | null } | null;
  progress: { total: number; sent: number; queued: number; percentComplete: number };
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [autopilot, setAutopilot] = useState<AutopilotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcingSend, setForcingSend] = useState(false);

  const fetchData = useCallback(async () => {
    const [campRes, autoRes] = await Promise.all([
      fetch(`/api/campaigns/${id}`).then((r) => r.json()),
      fetch(`/api/autopilot/${id}/status`).then((r) => r.json()).catch(() => null),
    ]);
    if (campRes.success) setCampaign(campRes.data);
    if (autoRes?.success) setAutopilot(autoRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function forceSendNow() {
    setForcingSend(true);
    const res = await fetch(`/api/autopilot/${id}/send-now`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Sending now", description: "Queue processed", variant: "success" });
      fetchData();
    } else {
      toast({ title: "Could not send", description: data.error, variant: "destructive" });
    }
    setForcingSend(false);
  }

  async function sendCampaign() {
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Queued", description: `${data.data.queued} emails queued`, variant: "success" });
      setCampaign((prev) => (prev ? { ...prev, status: "SENDING" } : prev));
    }
  }

  if (loading || !campaign) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = campaign.stats as {
    total: number; sent: number; opened: number; clicked: number;
    bounced: number; failed: number; unsubscribed: number;
  };

  const isAutopilot = campaign.mode === "AUTOPILOT";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name as string}</h1>
            <Badge>{campaign.status as string}</Badge>
            {isAutopilot && (
              <Badge variant="secondary" className="gap-1">
                <Rocket className="h-3 w-3" /> Autopilot
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{campaign.subject as string}</p>
        </div>
        {!isAutopilot && (campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
          <Button onClick={sendCampaign}>
            <Send className="h-4 w-4" /> Send Campaign
          </Button>
        )}
      </div>

      {isAutopilot && autopilot?.autopilot && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5 text-primary" />
              Autopilot Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>{autopilot.progress.sent} of {autopilot.progress.total} sent</span>
                <span className="font-medium">{autopilot.progress.percentComplete}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${autopilot.progress.percentComplete}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {autopilot.autopilot.stats.sentToday}/{autopilot.autopilot.dailyLimit} today
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>
                  {autopilot.autopilot.sendWindow.startHour}:00–{autopilot.autopilot.sendWindow.endHour}:00{" "}
                  {autopilot.autopilot.sendWindow.timezone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Rocket className="h-4 w-4 text-muted-foreground" />
                <span>~{autopilot.autopilot.estimatedDays} days total</span>
              </div>
            </div>

            {autopilot.autopilot.paused && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Paused: {autopilot.autopilot.pauseReason}
              </div>
            )}

            {autopilot.rateLimit && !autopilot.rateLimit.canSend && (
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
                Waiting: {autopilot.rateLimit.reason}
              </div>
            )}

            {autopilot.lastFailed?.error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Last error ({autopilot.lastFailed.email}): {autopilot.lastFailed.error}
              </div>
            )}

            {autopilot.progress.queued > 0 && campaign.status === "SENDING" && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {autopilot.progress.queued} emails queued — sending automatically in background
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={forcingSend}
                  onClick={forceSendNow}
                >
                  {forcingSend ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total" value={stats.total} icon={SendIcon} />
        <StatCard title="Sent" value={stats.sent} icon={SendIcon} />
        <StatCard title="Open Rate" value={formatPercent(stats.opened, stats.sent)} icon={MailOpen} trend="up" />
        <StatCard title="Click Rate" value={formatPercent(stats.clicked, stats.sent)} icon={MousePointerClick} trend="up" />
        <StatCard title="Bounced" value={stats.bounced} icon={AlertTriangle} />
        <StatCard title="Unsubscribed" value={stats.unsubscribed} icon={UserMinus} />
      </div>

      <Card>
        <CardHeader><CardTitle>Email Preview</CardTitle></CardHeader>
        <CardContent>
          <div
            className="rounded-lg border bg-white p-4"
            dangerouslySetInnerHTML={{ __html: campaign.htmlContent as string }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
