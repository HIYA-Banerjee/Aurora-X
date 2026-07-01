/**
 * RecommendationRepository – interface only, no implementation.
 */
export type RecommendationType =
  | 'MemoryRecommendation'
  | 'StoryRecommendation'
  | 'PhotoRecommendation';

export interface CreateRecommendationInput {
  userId: string;
  type: RecommendationType;
  explanation?: string;
  confidenceScore?: number;
}

export interface RecommendationFilters {
  userId?: string;
  type?: RecommendationType;
  minConfidence?: number;
}

export interface RecommendationRecord {
  id: string;
  userId: string;
  type: RecommendationType;
  explanation: string | null;
  confidenceScore: number | null;
  generatedAt: Date;
}

export interface IRecommendationRepository {
  findById(id: string): Promise<RecommendationRecord | null>;
  findMany(filters?: RecommendationFilters): Promise<RecommendationRecord[]>;
  create(data: CreateRecommendationInput): Promise<RecommendationRecord>;
  delete(id: string): Promise<void>;
}
