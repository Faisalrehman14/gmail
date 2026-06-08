"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface TagItem {
  id: string;
  name: string;
  color: string;
  _count: { contacts: number };
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function TagsPage() {
  const { toast } = useToast();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => d.success && setTags(d.data))
      .finally(() => setLoading(false));
  }, []);

  async function createTag() {
    if (!name) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    const data = await res.json();
    if (data.success) {
      setTags([...tags, { ...data.data, _count: { contacts: 0 } }]);
      setName("");
      toast({ title: "Tag created", variant: "success" });
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground">Label and categorize your contacts</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-6">
          <div className="flex-1">
            <Input placeholder="Tag name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`h-8 w-8 rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-offset-2 ring-primary" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <Button onClick={createTag}><Plus className="h-4 w-4" /> Add Tag</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tags.map((tag) => (
          <Card key={tag.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: tag.color + "20" }}>
                <Tag className="h-5 w-5" style={{ color: tag.color }} />
              </div>
              <div>
                <p className="font-medium">{tag.name}</p>
                <p className="text-xs text-muted-foreground">{tag._count.contacts} contacts</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
