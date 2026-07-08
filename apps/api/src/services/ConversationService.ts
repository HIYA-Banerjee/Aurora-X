import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../repositories/ConversationRepository';
import {
  CreateConversationInput,
  UpdateConversationInput,
  ConversationRecord,
} from '@aurora-x/shared-types';

@Injectable()
export class ConversationService {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async create(data: CreateConversationInput): Promise<ConversationRecord> {
    return this.conversationRepo.create(data);
  }

  async findById(id: string): Promise<ConversationRecord | null> {
    return this.conversationRepo.findById(id);
  }

  async findMany(filters?: any): Promise<ConversationRecord[]> {
    return this.conversationRepo.findMany(filters);
  }

  async update(
    id: string,
    data: UpdateConversationInput,
  ): Promise<ConversationRecord> {
    return this.conversationRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.conversationRepo.delete(id);
  }
}
