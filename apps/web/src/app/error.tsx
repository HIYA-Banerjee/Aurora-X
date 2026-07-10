'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Uncaught layout/page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-radial from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/50 dark:bg-red-950/20 border border-red-200/20 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tighter mb-2">System Error</h1>
      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground mb-6">
        An unexpected application error occurred.
      </h2>
      <div className="flex gap-4">
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
