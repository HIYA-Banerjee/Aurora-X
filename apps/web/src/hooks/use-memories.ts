import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useToastStore } from '../store/toast-store';

export interface Memory {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  location: string | null;
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  metadata: Record<string, any> | null;
  archived: boolean;
  favorite?: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  photos?: any[];
  stories?: any[];
}

export interface MemoriesQuery {
  limit?: number;
  cursor?: string;
  search?: string;
  archived?: boolean;
  favorite?: boolean;
  emotion?: string;
  importance?: number;
  visibility?: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  tag?: string;
}

// Fetch list of memories
export function useMemories(query: MemoriesQuery) {
  return useQuery({
    queryKey: ['memories', query],
    queryFn: async () => {
      // Build search query params
      const params = new URLSearchParams();
      if (query.limit) params.append('limit', String(query.limit));
      if (query.cursor) params.append('cursor', query.cursor);
      if (query.search) params.append('search', query.search);
      if (query.archived !== undefined) params.append('archived', String(query.archived));
      if (query.favorite !== undefined) params.append('favorite', String(query.favorite));
      if (query.emotion) params.append('emotion', query.emotion);
      if (query.importance !== undefined) params.append('importance', String(query.importance));
      if (query.visibility) params.append('visibility', query.visibility);
      if (query.tag) params.append('tag', query.tag);

      return (await api.get(`/api/v1/memories?${params.toString()}`)) as any;
    },
  });
}

// Fetch a single memory
export function useMemory(id: string) {
  return useQuery({
    queryKey: ['memory', id],
    queryFn: async () => {
      return (await api.get(`/api/v1/memories/${id}`)) as Memory;
    },
    enabled: !!id,
  });
}

// Create a new memory
export function useCreateMemory() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: async (dto: any) => {
      return await api.post('/api/v1/memories', dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      addToast({
        title: 'Memory Captured',
        description: 'Your moment was recorded successfully.',
        type: 'success',
      });
    },
  });
}

// Update a memory
export function useUpdateMemory() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: any }) => {
      return await api.patch(`/api/v1/memories/${id}`, dto);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['memory', data.id] });
      addToast({
        title: 'Memory Updated',
        description: 'Changes saved successfully.',
        type: 'success',
      });
    },
  });
}

// Soft delete memory
export function useDeleteMemory() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/api/v1/memories/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      addToast({
        title: 'Memory Deleted',
        description: 'The memory has been soft-deleted.',
        type: 'success',
        undoAction: {
          label: 'Undo Delete',
          onClick: async () => {
            try {
              await api.post(`/api/v1/memories/${id}/restore`);
              queryClient.invalidateQueries({ queryKey: ['memories'] });
            } catch (err) {
              console.error('Failed to restore memory:', err);
            }
          },
        },
      });
    },
  });
}

// Toggle Favorite Status
export function useFavoriteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.patch(`/api/v1/memories/${id}/favorite`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['memory', data.id] });
    },
  });
}

// Toggle Archive Status
export function useArchiveMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.patch(`/api/v1/memories/${id}/archive`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['memory', data.id] });
    },
  });
}
