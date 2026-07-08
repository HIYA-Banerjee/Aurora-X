import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Conversation as PrismaConversation, Prisma } from '@prisma/client';
import {
  CreateConversationInput,
  UpdateConversationInput,
} from '@aurora-x/shared-types';

@Injectable()
export class ConversationRepository extends BaseRepository<
  PrismaConversation,
  CreateConversationInput,
  UpdateConversationInput,
  Prisma.ConversationFindUniqueArgs,
  Prisma.ConversationFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'conversation');
  }

  // Additional conversation‑specific queries (e.g., fetch messages) can be added here
}
