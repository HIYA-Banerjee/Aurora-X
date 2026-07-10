'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { ErrorState } from '../../../components/ui/feedback';
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeCursor, setActiveCursor] = useState<string | undefined>(undefined);
  const [pageHistory, setPageHistory] = useState<(string | undefined)[]>([undefined]);

  // Fetch audit logs (ADMIN only)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-audit-logs', activeCursor],
    queryFn: async () => {
      const cursorParam = activeCursor ? `?cursor=${activeCursor}` : '';
      return (await api.get(`/api/v1/audit-logs${cursorParam}`)) as any;
    },
    enabled: user?.role === 'ADMIN',
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-red-200/20 bg-red-50/10 min-h-[400px]">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold tracking-tight">Access Denied</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          You must have the ADMIN role to access the workspace audit logs dashboard.
        </p>
      </div>
    );
  }

  const handleNextPage = () => {
    if (data?.nextCursor) {
      setPageHistory((prev) => [...prev, data.nextCursor]);
      setActiveCursor(data.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (pageHistory.length > 1) {
      const prevHistory = [...pageHistory];
      prevHistory.pop();
      const prevCursor = prevHistory[prevHistory.length - 1];
      setPageHistory(prevHistory);
      setActiveCursor(prevCursor);
    }
  };

  const items = data?.items || [];
  const hasNextPage = !!data?.nextCursor;
  const hasPrevPage = pageHistory.length > 1;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground text-sm">
          System audit logs logging database mutation activities and actors.
        </p>
      </div>

      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-bold">Workspace Audit Logs</CardTitle>
          <CardDescription>Comprehensive tracking records list.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : items.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Entity ID</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((log: any) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/10">
                      <td className="p-3">
                        <Badge
                          variant={
                            log.action === 'CREATE'
                              ? 'success'
                              : log.action === 'DELETE'
                              ? 'danger'
                              : log.action === 'UPDATE'
                              ? 'warning'
                              : 'info'
                          }
                          className="text-[10px]"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{log.entity}</td>
                      <td className="p-3 text-xs text-muted-foreground truncate max-w-[120px]" title={log.entityId}>
                        {log.entityId || 'N/A'}
                      </td>
                      <td className="p-3 text-xs">{log.actor?.email || 'System / Guest'}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paging controls */}
              <div className="flex items-center justify-between mt-4 border-t border-border/40 pt-4">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={!hasPrevPage}>
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {pageHistory.length}</span>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasNextPage}>
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">No audit logs logged.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
