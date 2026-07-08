import { Injectable } from '@nestjs/common';
import { StoryRepository } from '../repositories/StoryRepository';
import {
  CreateStoryInput,
  UpdateStoryInput,
  StoryRecord,
} from '@aurora-x/shared-types';

@Injectable()
export class StoryService {
  constructor(private readonly storyRepo: StoryRepository) {}

  async create(data: CreateStoryInput): Promise<StoryRecord> {
    return this.storyRepo.create(data);
  }

  async findById(id: string): Promise<StoryRecord | null> {
    return this.storyRepo.findById(id);
  }

  async findMany(filters?: any): Promise<StoryRecord[]> {
    return this.storyRepo.findMany(filters);
  }

  async update(id: string, data: UpdateStoryInput): Promise<StoryRecord> {
    return this.storyRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.storyRepo.delete(id);
  }
}
