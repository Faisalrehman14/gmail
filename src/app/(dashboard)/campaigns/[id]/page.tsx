"use client";

import { useEffect, useState, use } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { MailOpen, MousePointerClick, AlertTriangle, UserMinus, Send as SendIcon } from "lucide-react";
import { formatPercent } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((d) => d.success && setCampaign(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function sendCampaign() {
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Queued", description: `${data.data.queued} emails queued`, variant: "success" });
      setCampaign((prev) => prev ? { ...prev, status: "SENDING" } : prev);
    }
  }

  if (loading || !campaign) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const stats = campaign.stats as {
    total: number; sent: number; opened: number; clicked: number;
    bounced: number; failed: number; unsubscribed: number;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name as string}</h1>
            <Badge>{campaign.status as string}</Badge>
          </div>
          <p className="text-muted-foreground">{campaign.subject as string}</p>
        </div>
        {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
          <Button onClick={sendCampaign}><Send className="h-4 w-4" /> Send Campaign</Button>
        )}
      </div>

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
