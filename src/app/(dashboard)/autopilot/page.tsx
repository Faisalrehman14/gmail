"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PERSONALIZATION_VARIABLES } from "@/lib/personalization";

export default function AutopilotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    subject: "Hello {{first_name}}",
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
  <h1 style="color:#333">Hi {{first_name}},</h1>
  <p>We have something important to share with you.</p>
  <p>Best regards,<br>The Team</p>
</div>`,
    timezone: "Asia/Karachi",
  });

  async function handleLaunch() {
    if (!file || !form.name || !form.subject) {
      toast({ title: "Missing fields", description: "Upload a list and fill campaign details", variant: "destructive" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", form.name);
    formData.append("subject", form.subject);
    formData.append("htmlContent", form.htmlContent);
    formData.append("timezone", form.timezone);

    try {
      const res = await fetch("/api/autopilot/launch", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Autopilot launched!",
          description: data.data.message,
          variant: "success",
        });
        router.push(`/campaigns/${data.data.campaignId}`);
      } else {
        toast({ title: "Launch failed", description: data.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Rocket className="h-8 w-8 text-primary" />
          Autopilot Campaign
        </h1>
        <p className="text-muted-foreground">
          Upload your list — we handle verification, scheduling, rate limiting, and safe delivery
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Shield, title: "Auto Verification", desc: "Invalid & duplicate emails removed" },
          { icon: Clock, title: "Smart Scheduling", desc: "Spreads over days within safe limits" },
          { icon: Zap, title: "Rate Limited", desc: "Avoids spam filters & account blocks" },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="flex items-start gap-3 p-4">
              <item.icon className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Upload Email List</CardTitle>
          <CardDescription>CSV, Excel, or TXT — we verify every address automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-primary/5">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            {file ? (
              <p className="font-medium text-primary">{file.name}</p>
            ) : (
              <>
                <p className="font-medium">Drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground">Supports CSV, Excel, TXT</p>
              </>
            )}
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Campaign Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="June Newsletter"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Subject Line</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Hello {{first_name}}"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email Content (HTML)</Label>
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={form.htmlContent}
              onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="Asia/Karachi"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What happens automatically</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {[
            "Every email is verified — invalid addresses are removed",
            "Emails sent individually with personalization",
            "Daily & hourly limits based on your SMTP provider (Gmail: ~450/day)",
            "Warm-up ramp for large lists (starts slow, increases daily)",
            "Only sends between 9 AM – 6 PM in your timezone",
            "3-second delay between each email for deliverability",
            "Auto-pauses if bounce rate exceeds 5%",
            "Retries failed emails up to 3 times",
            "Unsubscribe link added to every email",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 pb-4">
        {PERSONALIZATION_VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            className="rounded-md border bg-muted px-2 py-1 text-xs font-mono hover:bg-accent"
            onClick={() => navigator.clipboard.writeText(v.key)}
          >
            {v.key}
          </button>
        ))}
      </div>

      <Button size="lg" className="w-full" disabled={loading || !file} onClick={handleLaunch}>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Rocket className="h-5 w-5" />
            Launch Autopilot Campaign
          </>
        )}
      </Button>
    </div>
  );
}
