import { Injectable } from '@nestjs/common';
import { MemoryRepository } from '../repositories/MemoryRepository';
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  MemoryRecord,
} from '@aurora-x/shared-types';

@Injectable()
export class MemoryService {
  constructor(private readonly memoryRepo: MemoryRepository) {}

  async create(data: CreateMemoryInput): Promise<MemoryRecord> {
    return this.memoryRepo.create(data);
  }

  async findById(id: string): Promise<MemoryRecord | null> {
    return this.memoryRepo.findById(id);
  }

  async findMany(filters?: any): Promise<MemoryRecord[]> {
    return this.memoryRepo.findMany(filters);
  }

  async update(id: string, data: UpdateMemoryInput): Promise<MemoryRecord> {
    return this.memoryRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.memoryRepo.delete(id);
  }
}
