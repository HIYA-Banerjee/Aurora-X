import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConversationRepository } from '../../repositories/ConversationRepository';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { OwnershipService } from '../../common/services/ownership.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationRole } from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly ownershipService: OwnershipService,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, _dto: CreateConversationDto) {
    // In our schema, a Conversation is owned by a single participantId (the user)
    return await this.prisma.conversation.create({
      data: {
        participantId: userId,
      },
    });
  }

  async findOne(userId: string, id: string, role?: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participant: { select: { id: true, email: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Access control: User must be the participant of the conversation
    if (role !== 'ADMIN' && role !== 'SYSTEM') {
      if (conversation.participantId !== userId) {
        throw new ForbiddenException(
          'Access denied: You do not own this conversation',
        );
      }
    }

    return conversation;
  }

  async delete(userId: string, id: string, role?: string) {
    const convo = await this.findOne(userId, id, role);
    await this.conversationRepo.hardDelete(convo.id);
  }

  async addMessage(
    userId: string,
    conversationId: string,
    dto: CreateMessageDto,
    role?: string,
  ) {
    // Verify ownership/access to the conversation
    await this.findOne(userId, conversationId, role);

    const prismaRole = dto.role.toUpperCase() as ConversationRole;

    return await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: prismaRole,
        content: dto.content,
        tokenUsage: dto.tokenUsage || null,
        model: dto.model || null,
      },
    });
  }

  async getMessages(
    userId: string,
    conversationId: string,
    query: MessageQueryDto,
    role?: string,
  ) {
    await this.findOne(userId, conversationId, role);

    const limit = query.limit || 20;
    const take = limit + 1;
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const skip = query.cursor ? 1 : 0;

    const records = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      take,
      cursor,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, limit) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
    };
  }

  async deleteMessage(
    userId: string,
    conversationId: string,
    messageId: string,
    role?: string,
  ) {
    await this.findOne(userId, conversationId, role);

    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      throw new NotFoundException('Message not found in this conversation');
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
  }

  async findMany(userId: string, query: ConversationQueryDto, role?: string) {
    const limit = query.limit || 20;
    const take = limit + 1;
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const skip = query.cursor ? 1 : 0;

    const where: any = {};

    if (role !== 'ADMIN' && role !== 'SYSTEM') {
      where.participantId = userId;
    }

    if (query.search) {
      where.participant = {
        email: { contains: query.search, mode: 'insensitive' },
      };
    }

    const records = await this.prisma.conversation.findMany({
      where,
      take,
      cursor,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        participant: { select: { id: true, email: true } },
      },
    });

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, limit) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
    };
  }
}
