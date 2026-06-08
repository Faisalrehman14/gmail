"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactTable } from "@/components/contacts/contact-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  status: string;
  isValid: boolean;
  tags: { tag: { name: string; color: string } }[];
}

export default function ContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [importing, setImporting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", firstName: "", lastName: "", company: "" });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "100",
      ...(search && { search }),
      ...(status !== "all" && { status }),
    });
    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    if (data.success) {
      setContacts(data.data.contacts);
      setTotal(data.data.pagination.total);
    }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchContacts, 300);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/contacts/import", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Import complete",
          description: `${data.data.created} created, ${data.data.updated} updated, ${data.data.invalid} invalid`,
          variant: "success",
        });
        fetchContacts();
      } else {
        toast({ title: "Import failed", description: data.error, variant: "destructive" });
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  async function handleAddContact() {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Contact added", variant: "success" });
      setShowAdd(false);
      setNewContact({ email: "", firstName: "", lastName: "", company: "" });
      fetchContacts();
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">{total.toLocaleString()} total contacts</p>
        </div>
        <div className="flex gap-2">
          <label>
            <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleImport} />
            <Button variant="outline" disabled={importing} asChild>
              <span>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import
              </span>
            </Button>
          </label>
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-lg">New Contact</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Email *" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
            <Input placeholder="First Name" value={newContact.firstName} onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })} />
            <Input placeholder="Last Name" value={newContact.lastName} onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })} />
            <Input placeholder="Company" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} />
            <Button onClick={handleAddContact} className="sm:col-span-2 lg:col-span-4 w-fit">Save Contact</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
            <SelectItem value="BOUNCED">Bounced</SelectItem>
            <SelectItem value="INVALID">Invalid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ContactTable contacts={contacts} />
      )}

      {total > 100 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 100)}</span>
          <Button variant="outline" disabled={page >= Math.ceil(total / 100)} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
