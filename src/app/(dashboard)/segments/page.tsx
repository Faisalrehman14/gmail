"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Segment {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number };
}

export default function SegmentsPage() {
  const { toast } = useToast();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/segments")
      .then((r) => r.json())
      .then((d) => d.success && setSegments(d.data))
      .finally(() => setLoading(false));
  }, []);

  async function createSegment() {
    if (!name) return;
    const res = await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, filters: {} }),
    });
    const data = await res.json();
    if (data.success) {
      setSegments([{ ...data.data, _count: { members: 0 } }, ...segments]);
      setName("");
      setDescription("");
      toast({ title: "Segment created", variant: "success" });
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segments</h1>
        <p className="text-muted-foreground">Dynamic contact groups based on filters</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 p-6">
          <Input placeholder="Segment name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="max-w-xs" />
          <Button onClick={createSegment}><Plus className="h-4 w-4" /> Create Segment</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((seg) => (
          <Card key={seg.id}>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{seg.name}</p>
                {seg.description && <p className="text-sm text-muted-foreground">{seg.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{seg._count.members} contacts</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
