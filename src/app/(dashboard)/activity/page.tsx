"use client";

import { useEffect, useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/activity?page=${page}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLogs(d.data.logs);
          setTotal(d.data.pagination.total);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">Audit trail of all platform actions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{log.action}</Badge>
                        <span className="text-sm font-medium">{log.entityType}</span>
                      </div>
                      {log.details && <p className="text-sm text-muted-foreground">{log.details}</p>}
                      {log.user && <p className="text-xs text-muted-foreground">by {log.user.name}</p>}
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {total > 50 && (
        <div className="flex justify-center gap-2">
          <button className="text-sm text-primary disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button className="text-sm text-primary disabled:opacity-50" disabled={page * 50 >= total} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
