'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { EmptyState } from '../../../components/ui/feedback';

export default function PhotosPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Photos Gallery</h1>
        <p className="text-muted-foreground text-sm">
          Browse through all media documents and images uploaded in memory modules.
        </p>
      </div>

      <div className="border-t border-border/60 pt-6">
        <EmptyState
          title="No Media Assets Found"
          description="Photos and images are associated with memories. Upload photos inside the memory capture workspace."
          icon={<ImageIcon className="h-10 w-10 text-emerald-500" />}
        />
      </div>
    </div>
  );
}
