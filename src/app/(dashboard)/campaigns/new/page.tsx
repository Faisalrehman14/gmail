"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERSONALIZATION_VARIABLES } from "@/lib/personalization";
import { useToast } from "@/hooks/use-toast";

const EmailEditor = dynamic(
  () => import("@/components/editor/email-editor").then((m) => m.EmailEditor),
  { ssr: false, loading: () => <div className="flex h-[600px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [segments, setSegments] = useState<{ id: string; name: string }[]>([]);
  const [smtpProviders, setSmtpProviders] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    htmlContent: "<div><h1>Hello {{first_name}}!</h1><p>We have exciting news for you.</p></div>",
    jsonDesign: "",
    listId: "",
    segmentId: "",
    smtpProviderId: "",
    scheduledAt: "",
    sendNow: false,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/lists").then((r) => r.json()),
      fetch("/api/segments").then((r) => r.json()),
      fetch("/api/smtp").then((r) => r.json()),
    ]).then(([listsRes, segmentsRes, smtpRes]) => {
      if (listsRes.success) setLists(listsRes.data);
      if (segmentsRes.success) setSegments(segmentsRes.data);
      if (smtpRes.success) setSmtpProviders(smtpRes.data);
    });
  }, []);

  async function handleSubmit(sendNow = false) {
    if (!form.name || !form.subject) {
      toast({ title: "Missing fields", description: "Name and subject are required", variant: "destructive" });
      return;
    }
    if (!form.listId && !form.segmentId) {
      toast({ title: "Missing audience", description: "Select a list or segment", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sendNow }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: sendNow ? "Campaign sent!" : "Campaign created", variant: "success" });
        router.push(`/campaigns/${data.data.id}`);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground">Design and schedule your email campaign</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Newsletter" />
          </div>
          <div className="space-y-2">
            <Label>Subject Line</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Hello {{first_name}}, check this out!" />
          </div>
          <div className="space-y-2">
            <Label>Email List</Label>
            <Select value={form.listId} onValueChange={(v) => setForm({ ...form, listId: v, segmentId: "" })}>
              <SelectTrigger><SelectValue placeholder="Select list" /></SelectTrigger>
              <SelectContent>
                {lists.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Or Segment</Label>
            <Select value={form.segmentId} onValueChange={(v) => setForm({ ...form, segmentId: v, listId: "" })}>
              <SelectTrigger><SelectValue placeholder="Select segment" /></SelectTrigger>
              <SelectContent>
                {segments.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>SMTP Provider</Label>
            <Select value={form.smtpProviderId} onValueChange={(v) => setForm({ ...form, smtpProviderId: v })}>
              <SelectTrigger><SelectValue placeholder="Default provider" /></SelectTrigger>
              <SelectContent>
                {smtpProviders.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Schedule (optional)</Label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalization Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PERSONALIZATION_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                className="rounded-md border bg-muted px-3 py-1 text-xs font-mono transition-colors hover:bg-accent"
                onClick={() => navigator.clipboard.writeText(v.key)}
              >
                {v.key}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Click to copy. Use in subject and email body.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email Design</CardTitle></CardHeader>
        <CardContent>
          <EmailEditor
            initialHtml={form.htmlContent}
            onChange={(html, design) => setForm({ ...form, htmlContent: html, jsonDesign: design })}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button variant="secondary" disabled={loading} onClick={() => handleSubmit(false)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
        </Button>
        <Button disabled={loading} onClick={() => handleSubmit(true)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Now"}
        </Button>
      </div>
    </div>
  );
}
