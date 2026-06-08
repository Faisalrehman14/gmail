"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Send, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  list: { name: string } | null;
  _count: { emails: number };
}

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  SENDING: "default",
  SENT: "success",
  PAUSED: "warning",
  CANCELLED: "destructive",
};

export default function CampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => d.success && setCampaigns(d.data))
      .finally(() => setLoading(false));
  }, []);

  async function sendCampaign(id: string) {
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Campaign queued", description: `${data.data.queued} emails queued`, variant: "success" });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: "SENDING" } : c)));
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage email campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button><Plus className="h-4 w-4" /> New Campaign</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Send className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No campaigns yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Create your first email campaign to get started</p>
            <Link href="/campaigns/new"><Button>Create Campaign</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/campaigns/${campaign.id}`} className="text-lg font-semibold hover:text-primary">
                      {campaign.name}
                    </Link>
                    <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {campaign.list && <span>List: {campaign.list.name}</span>}
                    <span>{campaign._count.emails} recipients</span>
                    {campaign.scheduledAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.scheduledAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
                    <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                      <Send className="h-4 w-4" /> Send
                    </Button>
                  )}
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
