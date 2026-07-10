'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Calendar,
  MapPin,
  Eye,
  Star,
  Archive,
  Trash2,
  Edit3,
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useMemory, useFavoriteMemory, useArchiveMemory, useDeleteMemory } from '../../../../hooks/use-memories';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ErrorState } from '../../../../components/ui/feedback';

export default function MemoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Fetch memory hooks
  const { data: memory, isLoading, isError, refetch } = useMemory(id);

  const { mutate: toggleFavorite } = useFavoriteMemory();
  const { mutate: toggleArchive } = useArchiveMemory();
  const { mutate: deleteMemory } = useDeleteMemory();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !memory) {
    return <ErrorState title="Memory Not Found" onRetry={refetch} />;
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteMemory(memory.id, {
        onSuccess: () => {
          router.push('/dashboard/memories');
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Navigation Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/dashboard/memories">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Memories
          </Button>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={memory.favorite ? 'subtle' : 'outline'}
            size="sm"
            onClick={() => toggleFavorite(memory.id)}
            leftIcon={<Star className={`h-4 w-4 ${memory.favorite && 'fill-amber-400 text-amber-400'}`} />}
          >
            {memory.favorite ? 'Favorited' : 'Favorite'}
          </Button>

          <Button
            variant={memory.archived ? 'subtle' : 'outline'}
            size="sm"
            onClick={() => toggleArchive(memory.id)}
            leftIcon={<Archive className="h-4 w-4 text-indigo-400" />}
          >
            {memory.archived ? 'Archived' : 'Archive'}
          </Button>

          <Link href={`/dashboard/memories/${memory.id}/edit`}>
            <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main split details view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-2xl font-bold tracking-tight">{memory.title}</CardTitle>
                {memory.favorite && <Star className="h-5 w-5 fill-amber-400 text-amber-400 shrink-0" />}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
                {memory.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(memory.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  </div>
                )}
                {memory.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{memory.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    {memory.visibility}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {memory.description || 'No description recorded for this memory.'}
            </CardContent>
            {memory.tags && memory.tags.length > 0 && (
              <div className="px-6 pb-6 pt-2 flex flex-wrap gap-2">
                {memory.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Linked Photos Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base font-bold">Associated Media</CardTitle>
              </div>
              <CardDescription>Photos attached to this memory moment.</CardDescription>
            </CardHeader>
            <CardContent>
              {memory.photos && memory.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {memory.photos.map((photo: any) => (
                    <div key={photo.id} className="relative rounded-lg overflow-hidden border border-border group aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`http://localhost:3000/uploads/${photo.storageKey}`}
                        alt="Memory Media"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                  No photos attached to this memory.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Sidebar Metadata / Stories */}
        <div className="flex flex-col gap-6">
          {/* Linked Stories Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base font-bold">Generated Stories</CardTitle>
              </div>
              <CardDescription>AI expanded stories linked to this moment.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {memory.stories && memory.stories.length > 0 ? (
                memory.stories.map((story: any) => (
                  <div key={story.id} className="border border-border rounded-lg p-3 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/10 transition-colors">
                    <p className="text-xs font-semibold text-muted-foreground">Generated via {story.generationModel}</p>
                    <p className="text-sm text-foreground line-clamp-3 mt-1">{story.generatedContent}</p>
                    <Link href={`/dashboard/stories/${story.id}`} className="text-xs text-primary font-bold hover:underline mt-2 inline-block">
                      Open Story →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No stories generated from this memory yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base font-bold">Analysis Details</CardTitle>
              </div>
              <CardDescription>AI parsed emotional and contextual metadata.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Dominant Emotion</span>
                <span className="font-semibold capitalize">{memory.metadata?.emotion || 'Neutral'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Importance Rating</span>
                <span className="font-semibold">{memory.metadata?.importance !== undefined ? `${memory.metadata.importance}/10` : 'Not Rated'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Date Captured</span>
                <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Edited</span>
                <span>{new Date(memory.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
