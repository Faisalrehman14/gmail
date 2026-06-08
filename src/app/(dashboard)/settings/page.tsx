"use client";

import { useEffect, useState } from "react";
import { Plus, Server, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const [form, setForm] = useState({
    name: "",
    host: "",
    port: "587",
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
    secure: false,
    isDefault: true,
  });

  useEffect(() => {
    fetch("/api/smtp")
      .then((r) => r.json())
      .then((d) => d.success && setProviders(d.data))
      .finally(() => setLoading(false));
  }, []);

  async function addProvider() {
    const res = await fetch("/api/smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, port: parseInt(form.port) }),
    });
    const data = await res.json();
    if (data.success) {
      setProviders([data.data, ...providers]);
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
      description: data.error,
      variant: data.success ? "success" : "destructive",
    });
    setTesting(null);
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure SMTP providers and integrations</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SMTP Providers</CardTitle>
            <CardDescription>Configure email delivery providers</CardDescription>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Provider</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAdd && (
            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 animate-fade-in">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gmail SMTP" /></div>
              <div className="space-y-2"><Label>Host</Label><Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="smtp.gmail.com" /></div>
              <div className="space-y-2"><Label>Port</Label><Input value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} /></div>
              <div className="space-y-2"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="space-y-2"><Label>From Email</Label><Input value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} /></div>
              <div className="space-y-2"><Label>From Name</Label><Input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} /></div>
              <Button onClick={addProvider} className="sm:col-span-2 w-fit">Save Provider</Button>
            </div>
          )}

          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No SMTP providers configured. Add one to start sending emails.</p>
          ) : (
            providers.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{p.name}</p>
                      {p.isDefault && <Badge>Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{p.host}:{p.port} · {p.fromEmail}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={testing === p.id} onClick={() => testProvider(p.id)}>
                  {testing === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Test
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
