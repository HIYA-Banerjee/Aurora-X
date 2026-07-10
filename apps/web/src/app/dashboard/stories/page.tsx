'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { BookOpen, Sparkles } from 'lucide-react';
import { EmptyState } from '../../../components/ui/feedback';

export default function StoriesPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Stories</h1>
        <p className="text-muted-foreground text-sm">
          Browse through AI expanded timelines and narratives generated from your memories.
        </p>
      </div>

      <div className="border-t border-border/60 pt-6">
        <EmptyState
          title="No Stories Generated Yet"
          description="AI Timelines expand your memories into creative stories. Write more memory moments to trigger story proposals."
          icon={<BookOpen className="h-10 w-10 text-amber-500" />}
        />
      </div>
    </div>
  );
}
