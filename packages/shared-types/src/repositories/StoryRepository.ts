/**
 * StoryRepository – interface only, no implementation.
 */
export interface CreateStoryInput {
  ownerId: string;
  sourceMemoryId?: string;
  generatedContent: string;
  generationModel: string;
  promptVersion?: string;
}

export interface UpdateStoryInput {
  generatedContent?: string;
  generationModel?: string;
  promptVersion?: string;
}

export interface StoryFilters {
  ownerId?: string;
  sourceMemoryId?: string;
  generationModel?: string;
}

export interface StoryRecord {
  id: string;
  ownerId: string;
  sourceMemoryId: string | null;
  generatedContent: string;
  generationModel: string;
  promptVersion: string | null;
  createdAt: Date;
}

export interface IStoryRepository {
  findById(id: string): Promise<StoryRecord | null>;
  findMany(filters?: StoryFilters): Promise<StoryRecord[]>;
  create(data: CreateStoryInput): Promise<StoryRecord>;
  update(id: string, data: UpdateStoryInput): Promise<StoryRecord>;
  delete(id: string): Promise<void>;
}
