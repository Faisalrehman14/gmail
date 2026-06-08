"use client";

import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface ContactTableProps {
  contacts: Contact[];
  onSelect?: (contact: Contact) => void;
}

const statusVariant: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  ACTIVE: "success",
  UNSUBSCRIBED: "warning",
  BOUNCED: "destructive",
  INVALID: "destructive",
};

export function ContactTable({ contacts, onSelect }: ContactTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: contacts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-[1fr_1fr_1fr_120px_100px] gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground">
        <span>Email</span>
        <span>Name</span>
        <span>Company</span>
        <span>Status</span>
        <span>Tags</span>
      </div>
      <div ref={parentRef} className="h-[600px] overflow-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {items.map((virtualRow) => {
            const contact = contacts[virtualRow.index];
            return (
              <div
                key={contact.id}
                className={cn(
                  "absolute left-0 top-0 grid w-full grid-cols-[1fr_1fr_1fr_120px_100px] gap-4 border-b px-4 py-3 text-sm transition-colors hover:bg-accent/50",
                  onSelect && "cursor-pointer"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onSelect?.(contact)}
              >
                <span className="truncate font-medium">{contact.email}</span>
                <span className="truncate text-muted-foreground">
                  {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                </span>
                <span className="truncate text-muted-foreground">{contact.company || "—"}</span>
                <Badge variant={statusVariant[contact.status] || "secondary"} className="w-fit">
                  {contact.status}
                </Badge>
                <div className="flex gap-1 overflow-hidden">
                  {contact.tags.slice(0, 2).map((t) => (
                    <span
                      key={t.tag.name}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: t.tag.color }}
                    >
                      {t.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
