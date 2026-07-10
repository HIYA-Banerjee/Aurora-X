'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-radial from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border mb-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tighter mb-2">404</h1>
      <h2 className="text-lg font-semibold tracking-tight mb-2">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        The workspace path you are trying to visit does not exist or has been relocated.
      </p>
      <Link href="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
