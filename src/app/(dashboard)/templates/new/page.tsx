"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const EmailEditor = dynamic(
  () => import("@/components/editor/email-editor").then((m) => m.EmailEditor),
  { ssr: false, loading: () => <div className="flex h-[600px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    htmlContent: "<div><h1>Hello {{first_name}}!</h1></div>",
    jsonDesign: "",
  });

  async function handleSave() {
    if (!form.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Template saved", variant: "success" });
      router.push("/templates");
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">New Template</h1>
      <Card>
        <CardHeader><CardTitle>Template Info</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Default Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Design</CardTitle></CardHeader>
        <CardContent>
          <EmailEditor
            initialHtml={form.htmlContent}
            onChange={(html, design) => setForm({ ...form, htmlContent: html, jsonDesign: design })}
          />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button disabled={loading} onClick={handleSave}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Template"}
        </Button>
      </div>
    </div>
  );
}
