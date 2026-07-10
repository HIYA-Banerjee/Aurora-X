'use client';

import React, { use } from 'react';
import MemoryEditor from '../../../../../features/memories/components/memory-editor';
import { useMemory, useUpdateMemory } from '../../../../../hooks/use-memories';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { ErrorState } from '../../../../../components/ui/feedback';

export default function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Load data
  const { data: memory, isLoading, isError, refetch } = useMemory(id);
  const { mutateAsync: updateMemory } = useUpdateMemory();

  const handleSave = async (payload: any) => {
    return await updateMemory({ id, dto: payload });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !memory) {
    return <ErrorState title="Memory Not Found" onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1 border-b border-border/40 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Edit Memory</h1>
        <p className="text-sm text-muted-foreground">
          Update the title, details, analysis metadata or media configurations.
        </p>
      </div>
      <MemoryEditor id={id} initialData={memory} onSave={handleSave} />
    </div>
  );
}
