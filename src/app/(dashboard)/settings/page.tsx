"use client";

import { useEffect, useState } from "react";
import { Plus, Server, CheckCircle, Loader2, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SMTP_PRESETS } from "@/lib/smtp-providers";

interface SmtpProvider {
  id: string;
  name: string;
  host: string;
  port: number;
  fromEmail: string;
  isDefault: boolean;
  isActive: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<SmtpProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("gmail");
  const [form, setForm] = useState({
    name: "Gmail",
    host: "smtp.gmail.com",
    port: "587",
    username: "",
    password: "",
    fromEmail: "",
    fromName: "MailFlow",
    secure: false,
    isDefault: true,
  });

  useEffect(() => {
    fetch("/api/smtp")
      .then((r) => r.json())
      .then((d) => d.success && setProviders(d.data))
      .finally(() => setLoading(false));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && setTestEmail(d.data.user.email));
  }, []);

  function applyPreset(presetId: string) {
    const preset = SMTP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setForm({
      ...form,
      name: preset.name,
      host: preset.host,
      port: String(preset.port),
      secure: preset.secure,
    });
  }

  async function addProvider() {
    if (!form.host || !form.username || !form.password || !form.fromEmail) {
      toast({ title: "Missing fields", description: "Fill all required fields", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, port: parseInt(form.port) }),
    });
    const data = await res.json();
    if (data.success) {
      setProviders([{ ...data.data, isActive: true }, ...providers]);
      setShowAdd(false);
      toast({ title: "SMTP provider added", variant: "success" });
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  async function testProvider(id: string) {
    setTesting(id);
    const res = await fetch(`/api/smtp/${id}/test`, { method: "POST" });
    const data = await res.json();
    toast({
      title: data.success ? "Connection successful" : "Connection failed",
      description: data.error || "SMTP server is reachable",
      variant: data.success ? "success" : "destructive",
    });
    setTesting(null);
  }

  async function sendTestEmail(id: string) {
    if (!testEmail) {
      toast({ title: "Enter test email address", variant: "destructive" });
      return;
    }
    setSendingTest(id);
    const res = await fetch(`/api/smtp/${id}/send-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testEmail }),
    });
    const data = await res.json();
    toast({
      title: data.success ? "Test email sent!" : "Send failed",
      description: data.success ? `Check inbox: ${testEmail}` : data.error,
      variant: data.success ? "success" : "destructive",
    });
    setSendingTest(null);
  }

  const activeProvider = providers.find((p) => p.isDefault && p.isActive);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure real SMTP to send emails</p>
      </div>

      <Card className={activeProvider ? "border-success/50" : "border-warning/50"}>
        <CardContent className="flex items-center gap-4 p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeProvider ? "bg-success/10" : "bg-warning/10"}`}>
            <Mail className={`h-6 w-6 ${activeProvider ? "text-success" : "text-warning"}`} />
          </div>
          <div>
            <p className="font-semibold">
              {activeProvider ? "Email sending is configured" : "Email sending not configured"}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeProvider
                ? `Using ${activeProvider.name} (${activeProvider.fromEmail})`
                : "Add an SMTP provider below to send real emails"}
            </p>
          </div>
          {activeProvider && <Badge variant="success">Ready</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SMTP Providers</CardTitle>
            <CardDescription>Connect Gmail, SendGrid, Brevo, or any SMTP</CardDescription>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4" /> Add Provider
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAdd && (
            <div className="space-y-4 rounded-lg border p-4 animate-fade-in">
              <div>
                <Label className="mb-2 block">Provider</Label>
                <div className="flex flex-wrap gap-2">
                  {SMTP_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        selectedPreset === p.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {SMTP_PRESETS.find((p) => p.id === selectedPreset)?.docs}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Host</Label>
                  <Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder={SMTP_PRESETS.find((p) => p.id === selectedPreset)?.usernameHint}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password / API Key</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} placeholder="you@gmail.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>From Name</Label>
                  <Input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
                </div>
              </div>
              <Button onClick={addProvider}>Save Provider</Button>
            </div>
          )}

          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No SMTP providers yet. Add Gmail or SendGrid to start sending real emails.
            </p>
          ) : (
            providers.map((p) => (
              <div key={p.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Server className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{p.name}</p>
                        {p.isDefault && <Badge>Default</Badge>}
                        {!p.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p.host}:{p.port} · {p.fromEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={testing === p.id} onClick={() => testProvider(p.id)}>
                      {testing === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Test
                    </Button>
                    <Button size="sm" disabled={sendingTest === p.id || !p.isActive} onClick={() => sendTestEmail(p.id)}>
                      {sendingTest === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Test
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {providers.length > 0 && (
            <div className="flex items-end gap-3 border-t pt-4">
              <div className="flex-1 space-y-2">
                <Label>Send test email to</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Primary Inbox Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Set <strong>From Name</strong> to your real name (e.g. &quot;Muhammad&quot;) — not &quot;MailFlow&quot;</p>
          <p>2. Railway variable: <code>SMTP_SENDER_NAME=Muhammad</code></p>
          <p>3. Railway variable: <code>EMAIL_DELIVERY_MODE=primary</code> (default)</p>
          <p>4. Write emails like personal messages — no marketing language</p>
          <p>5. Subject: simple text like &quot;Quick note&quot; not &quot;Hello Name - Offer&quot;</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gmail Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Go to <strong>myaccount.google.com</strong> → Security → Enable <strong>2-Step Verification</strong></p>
          <p>2. Search <strong>App Passwords</strong> → Create one for &quot;Mail&quot;</p>
          <p>3. Use that 16-character password here (not your Gmail password)</p>
          <p>4. Host: <code>smtp.gmail.com</code> · Port: <code>587</code> · Username: your Gmail</p>
        </CardContent>
      </Card>
    </div>
  );
}
