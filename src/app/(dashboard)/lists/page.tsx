"use client";

import { useEffect, useState } from "react";
import { Plus, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ContactList {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number };
  createdAt: string;
}

export default function ListsPage() {
  const { toast } = useToast();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/lists")
      .then((r) => r.json())
      .then((d) => d.success && setLists(d.data))
      .finally(() => setLoading(false));
  }, []);

  async function createList() {
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (data.success) {
      setLists([data.data, ...lists]);
      setShowCreate(false);
      setName("");
      setDescription("");
      toast({ title: "List created", variant: "success" });
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Lists</h1>
          <p className="text-muted-foreground">Organize contacts into mailing lists</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New List</Button>
      </div>

      {showCreate && (
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-lg">Create List</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="List name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button onClick={createList} className="w-fit">Create</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Card key={list.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <List className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{list.name}</h3>
                  {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
                  <p className="mt-2 text-sm font-medium">{list._count.members} contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
