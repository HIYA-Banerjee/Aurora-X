'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  LayoutGrid,
  List,
  Star,
  Archive,
  Trash2,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  FolderSync,
} from 'lucide-react';
import { useMemories, useFavoriteMemory, useArchiveMemory, useDeleteMemory } from '../../../hooks/use-memories';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { SkeletonGrid } from '../../../components/ui/skeleton';
import { EmptyState, ErrorState } from '../../../components/ui/feedback';

export default function MemoriesList() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterFavorite, setFilterFavorite] = useState<boolean | undefined>(undefined);
  const [filterArchived, setFilterArchived] = useState<boolean>(false);
  const [filterVisibility, setFilterVisibility] = useState<'PRIVATE' | 'SHARED' | 'PUBLIC' | undefined>(undefined);
  const [activeCursor, setActiveCursor] = useState<string | undefined>(undefined);
  const [pageHistory, setPageHistory] = useState<(string | undefined)[]>([undefined]);

  // Hook query
  const { data, isLoading, isError, refetch } = useMemories({
    limit: 9,
    cursor: activeCursor,
    search: search || undefined,
    favorite: filterFavorite,
    archived: filterArchived,
    visibility: filterVisibility,
  });

  const { mutate: toggleFavorite } = useFavoriteMemory();
  const { mutate: toggleArchive } = useArchiveMemory();
  const { mutate: deleteMemory } = useDeleteMemory();

  const handleNextPage = () => {
    if (data?.nextCursor) {
      setPageHistory((prev) => [...prev, data.nextCursor]);
      setActiveCursor(data.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (pageHistory.length > 1) {
      const prevHistory = [...pageHistory];
      prevHistory.pop(); // Remove current cursor
      const prevCursor = prevHistory[prevHistory.length - 1];
      setPageHistory(prevHistory);
      setActiveCursor(prevCursor);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterFavorite(undefined);
    setFilterArchived(false);
    setFilterVisibility(undefined);
    setActiveCursor(undefined);
    setPageHistory([undefined]);
  };

  const hasNextPage = !!data?.nextCursor;
  const hasPrevPage = pageHistory.length > 1;
  const items = data?.items || [];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Memories</h1>
          <p className="text-muted-foreground text-sm">
            Manage your captured moments, thoughts, and reflections.
          </p>
        </div>
        <Link href="/dashboard/memories/new">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Capture Moment
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between border-y border-border py-4 bg-zinc-50/20 dark:bg-zinc-950/5 px-2 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveCursor(undefined);
                setPageHistory([undefined]);
              }}
              className="w-full bg-card text-foreground pl-9 pr-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button
            variant={filterFavorite ? 'subtle' : 'outline'}
            size="sm"
            onClick={() => {
              setFilterFavorite(filterFavorite ? undefined : true);
              setActiveCursor(undefined);
              setPageHistory([undefined]);
            }}
            leftIcon={<Star className="h-3.5 w-3.5" />}
          >
            Favorites
          </Button>

          <Button
            variant={filterArchived ? 'subtle' : 'outline'}
            size="sm"
            onClick={() => {
              setFilterArchived(!filterArchived);
              setActiveCursor(undefined);
              setPageHistory([undefined]);
            }}
            leftIcon={<Archive className="h-3.5 w-3.5" />}
          >
            Archived
          </Button>

          <select
            value={filterVisibility || ''}
            onChange={(e) => {
              setFilterVisibility((e.target.value as any) || undefined);
              setActiveCursor(undefined);
              setPageHistory([undefined]);
            }}
            className="bg-card text-foreground px-3 py-1.5 border border-border rounded-lg text-sm cursor-pointer focus:outline-none"
          >
            <option value="">All Visibilities</option>
            <option value="PRIVATE">Private</option>
            <option value="SHARED">Shared</option>
            <option value="PUBLIC">Public</option>
          </select>

          {(search || filterFavorite !== undefined || filterArchived || filterVisibility) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Layout Toggles */}
        <div className="flex items-center gap-1.5 border border-border p-1 rounded-lg bg-card">
          <button
            onClick={() => setLayout('grid')}
            className={`p-1.5 rounded-md hover:bg-muted text-muted-foreground ${layout === 'grid' && 'bg-zinc-100 dark:bg-zinc-800 text-foreground'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout('list')}
            className={`p-1.5 rounded-md hover:bg-muted text-muted-foreground ${layout === 'list' && 'bg-zinc-100 dark:bg-zinc-800 text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid or List items view */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-6">
          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((mem: any) => (
                <Card key={mem.id} className="group relative flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 bg-card">
                  <div>
                    {/* Header bar controls */}
                    <div className="flex items-start justify-between p-6 pb-2">
                      <div className="flex flex-col gap-1 max-w-[80%]">
                        <Link href={`/dashboard/memories/${mem.id}`} className="hover:underline">
                          <h3 className="font-bold text-lg tracking-tight truncate">{mem.title}</h3>
                        </Link>
                        {mem.eventDate && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(mem.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        )}
                      </div>

                      {/* Toggles bar */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(mem.id)}
                          className={`p-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors ${mem.favorite ? 'text-amber-400' : 'text-muted-foreground/60 hover:text-foreground'}`}
                        >
                          <Star className={`h-4 w-4 ${mem.favorite && 'fill-amber-400'}`} />
                        </button>
                        <button
                          onClick={() => toggleArchive(mem.id)}
                          className={`p-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors ${mem.archived ? 'text-indigo-400' : 'text-muted-foreground/60 hover:text-foreground'}`}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="px-6 text-sm text-muted-foreground line-clamp-3">
                      {mem.description || 'No description captured.'}
                    </div>

                    {/* Tags List */}
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="px-6 py-2 flex flex-wrap gap-1.5 mt-2">
                        {mem.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between mt-4 px-6 py-3 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-muted-foreground">
                    <span>📍 {mem.location || 'Unknown Location'}</span>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/memories/${mem.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                          Edit
                        </Button>
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Delete this memory?')) {
                            deleteMemory(mem.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded-md cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // List Layout
            <div className="flex flex-col gap-3">
              {items.map((mem: any) => (
                <Card key={mem.id} className="hover:border-zinc-300 dark:hover:border-zinc-700 bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/memories/${mem.id}`} className="hover:underline min-w-0">
                        <h3 className="font-bold text-base truncate">{mem.title}</h3>
                      </Link>
                      {mem.favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />}
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {mem.visibility}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                      {mem.eventDate && (
                        <span>🕒 {new Date(mem.eventDate).toLocaleDateString()}</span>
                      )}
                      <span>📍 {mem.location || 'Unknown'}</span>
                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex gap-1 items-center ml-2 border-l border-border pl-2">
                          {mem.tags.map((t: string) => (
                            <span key={t} className="text-[10px]">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(mem.id)}
                      className={`p-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors ${mem.favorite ? 'text-amber-400' : 'text-muted-foreground/60'}`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleArchive(mem.id)}
                      className={`p-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors ${mem.archived ? 'text-indigo-400' : 'text-muted-foreground/60'}`}
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <Link href={`/dashboard/memories/${mem.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this memory?')) {
                          deleteMemory(mem.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-2 rounded-md cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Cursor Paging Toolbar */}
          <div className="flex items-center justify-between border-t border-border/80 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={!hasPrevPage}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {pageHistory.length}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Memories Captured"
          description="Reflect and capture your life moments. Click the button below to write your first entry."
          actionLabel="Capture Moment"
          onAction={() => (window.location.href = '/dashboard/memories/new')}
          icon={<Brain className="h-10 w-10 text-indigo-500" />}
        />
      )}
    </div>
  );
}
