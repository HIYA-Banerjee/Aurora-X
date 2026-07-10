'use client';

import React from 'react';
import MemoryEditor from '../../../../features/memories/components/memory-editor';
import { useCreateMemory } from '../../../../hooks/use-memories';

export default function NewMemoryPage() {
  const { mutateAsync: createMemory } = useCreateMemory();

  const handleSave = async (payload: any) => {
    return await createMemory(payload);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1 border-b border-border/40 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Capture Moment</h1>
        <p className="text-sm text-muted-foreground">
          Record a new reflection, detail, and attach relevant media documents.
        </p>
      </div>
      <MemoryEditor onSave={handleSave} />
    </div>
  );
}
