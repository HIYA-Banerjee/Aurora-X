import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from '../conversation.service';
import { ConversationRepository } from '../../../repositories/ConversationRepository';
import { OwnershipService } from '../../../common/services/ownership.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockConversationRepo = {
  hardDelete: jest.fn(),
};

const mockOwnershipService = {
  checkOwnership: jest.fn(),
};

const mockPrisma = {
  conversation: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  chatMessage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: ConversationRepository, useValue: mockConversationRepo },
        { provide: OwnershipService, useValue: mockOwnershipService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const convo = {
        id: 'conv-1',
        participantId: 'user-1',
        createdAt: new Date(),
      };
      mockPrisma.conversation.create.mockResolvedValue(convo);

      const result = await service.create('user-1', {});
      expect(result).toEqual(convo);
      expect(mockPrisma.conversation.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when conversation does not exist', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne('user-1', 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the participant', async () => {
      const convo = {
        id: 'conv-1',
        participantId: 'user-2', // different user
        participant: { id: 'user-2', email: 'other@test.com' },
      };
      mockPrisma.conversation.findUnique.mockResolvedValue(convo);
      await expect(service.findOne('user-1', 'conv-1', 'USER')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow ADMIN to access any conversation', async () => {
      const convo = {
        id: 'conv-1',
        participantId: 'user-2',
        participant: { id: 'user-2', email: 'other@test.com' },
      };
      mockPrisma.conversation.findUnique.mockResolvedValue(convo);
      const result = await service.findOne('user-1', 'conv-1', 'ADMIN');
      expect(result).toEqual(convo);
    });
  });

  describe('deleteMessage', () => {
    it('should throw NotFoundException when message does not exist in conversation', async () => {
      const convo = {
        id: 'conv-1',
        participantId: 'user-1',
        participant: { id: 'user-1', email: 'user@test.com' },
      };
      mockPrisma.conversation.findUnique.mockResolvedValue(convo);
      mockPrisma.chatMessage.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteMessage('user-1', 'conv-1', 'non-existent-msg-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMessages (cursor pagination)', () => {
    it('should return paginated messages with nextCursor when more pages exist', async () => {
      const messages = [
        { id: 'msg-1', content: 'hello' },
        { id: 'msg-2', content: 'world' },
        { id: 'msg-3', content: 'overflow' }, // this one signals hasNextPage
      ];
      const convo = {
        id: 'conv-1',
        participantId: 'user-1',
        participant: { id: 'user-1', email: 'user@test.com' },
      };
      mockPrisma.conversation.findUnique.mockResolvedValue(convo);
      mockPrisma.chatMessage.findMany.mockResolvedValue(messages);

      const result = await service.getMessages('user-1', 'conv-1', {
        limit: 2,
      });
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('msg-2');
    });
  });
});
