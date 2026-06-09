"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const EmailEditor = dynamic(
  () => import("@/components/editor/email-editor").then((m) => m.EmailEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

interface Template {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  jsonDesign: string | null;
  updatedAt: string;
}

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [form, setForm] = useState<Template | null>(null);

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setForm(d.data);
        } else {
          toast({ title: "Template not found", variant: "destructive" });
          router.push("/templates");
        }
      })
      .finally(() => setLoading(false));
  }, [id, router, toast]);

  async function handleSave() {
    if (!form?.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        subject: form.subject,
        htmlContent: form.htmlContent,
        jsonDesign: form.jsonDesign,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Template saved", variant: "success" });
      setForm(data.data);
      setMode("preview");
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Template deleted", variant: "success" });
      router.push("/templates");
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
      setDeleting(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isBranded =
    form.htmlContent.includes('data-mailflow="branded"') ||
    form.htmlContent.trim().startsWith("<!DOCTYPE");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{form.name}</h1>
            <p className="text-muted-foreground">{form.subject}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={mode === "preview" ? "default" : "outline"}
            onClick={() => setMode("preview")}
          >
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button
            variant={mode === "edit" ? "default" : "outline"}
            onClick={() => setMode("edit")}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {mode === "edit" && (
        <Card>
          <CardHeader>
            <CardTitle>Template Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{mode === "preview" ? "Email Preview" : "Design"}</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === "preview" ? (
            <div className="overflow-hidden rounded-lg border bg-[#0a1628]">
              <iframe
                title="Email preview"
                srcDoc={form.htmlContent}
                className="h-[720px] w-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          ) : isBranded ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is a full branded HTML template. Edit the HTML directly below.
              </p>
              <textarea
                className="min-h-[500px] w-full rounded-lg border bg-muted/30 p-4 font-mono text-xs"
                value={form.htmlContent}
                onChange={(e) =>
                  setForm({ ...form, htmlContent: e.target.value })
                }
              />
            </div>
          ) : (
            <EmailEditor
              initialHtml={form.htmlContent}
              initialDesign={form.jsonDesign || undefined}
              onChange={(html, design) =>
                setForm({ ...form, htmlContent: html, jsonDesign: design })
              }
            />
          )}
        </CardContent>
      </Card>

      {mode === "edit" && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setMode("preview")}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Template"}
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Last updated {new Date(form.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
