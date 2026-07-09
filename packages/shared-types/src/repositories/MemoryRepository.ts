/**
 * MemoryRepository – interface only, no implementation.
 */
export type Visibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface CreateMemoryInput {
  ownerId: string;
  title: string;
  description?: string;
  eventDate?: Date;
  location?: string;
  visibility?: Visibility;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryInput {
  title?: string;
  description?: string;
  eventDate?: Date;
  location?: string;
  visibility?: Visibility;
  metadata?: Record<string, unknown>;
}

export interface MemoryFilters {
  ownerId?: string;
  visibility?: Visibility;
  tagNames?: string[];
}

export interface MemoryRecord {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  eventDate: Date | null;
  location: string | null;
  visibility: Visibility;
  metadata: Record<string, unknown> | null;
  archived?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemoryRepository {
  findById(id: string): Promise<MemoryRecord | null>;
  findMany(filters?: MemoryFilters): Promise<MemoryRecord[]>;
  create(data: CreateMemoryInput): Promise<MemoryRecord>;
  update(id: string, data: UpdateMemoryInput): Promise<MemoryRecord>;
  delete(id: string): Promise<void>;
  addTag(memoryId: string, tagId: string): Promise<void>;
  removeTag(memoryId: string, tagId: string): Promise<void>;
}
