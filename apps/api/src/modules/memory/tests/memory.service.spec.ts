import { Test, TestingModule } from '@nestjs/testing';
import { MemoryService } from '../memory.service';
import { MemoryRepository } from '../../../repositories/MemoryRepository';
import { OwnershipService } from '../../../common/services/ownership.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

const mockMemoryRepo = {
  findById: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  hardDelete: jest.fn(),
};

const mockOwnershipService = {
  checkOwnership: jest.fn(),
};

const mockPrisma = {
  memory: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

describe('MemoryService', () => {
  let service: MemoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        { provide: MemoryRepository, useValue: mockMemoryRepo },
        { provide: OwnershipService, useValue: mockOwnershipService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when memory does not exist', async () => {
      mockMemoryRepo.findById.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when memory is soft-deleted', async () => {
      const deletedMemory = { id: 'mem-1', ownerId: 'user-1', deletedAt: new Date(), title: 'Test' };
      mockMemoryRepo.findById.mockResolvedValue(deletedMemory);
      await expect(service.findOne('user-1', 'mem-1')).rejects.toThrow(NotFoundException);
    });

    it('should return memory when found and ownership passes', async () => {
      const memory = { id: 'mem-1', ownerId: 'user-1', deletedAt: null, title: 'Test' };
      mockMemoryRepo.findById.mockResolvedValue(memory);
      mockOwnershipService.checkOwnership.mockReturnValue(undefined);
      const result = await service.findOne('user-1', 'mem-1');
      expect(result).toEqual(memory);
    });

    it('should throw ForbiddenException when user does not own the memory', async () => {
      const memory = { id: 'mem-1', ownerId: 'user-2', deletedAt: null, title: 'Test' };
      mockMemoryRepo.findById.mockResolvedValue(memory);
      mockOwnershipService.checkOwnership.mockImplementation(() => {
        throw new ForbiddenException('You do not own this resource');
      });
      await expect(service.findOne('user-1', 'mem-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update — optimistic concurrency', () => {
    it('should throw ConflictException when client sends a stale updatedAt', async () => {
      const memory = {
        id: 'mem-1',
        ownerId: 'user-1',
        deletedAt: null,
        updatedAt: new Date('2026-07-01T00:00:00.000Z'),
        tags: [],
      };
      mockPrisma.memory.findUnique.mockResolvedValue(memory);
      mockOwnershipService.checkOwnership.mockReturnValue(undefined);

      await expect(
        service.update('user-1', 'mem-1', {
          title: 'New Title',
          updatedAt: '2025-01-01T00:00:00.000Z', // intentionally stale
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should succeed when updatedAt matches the current DB value', async () => {
      const now = new Date('2026-07-01T00:00:00.000Z');
      const memory = { id: 'mem-1', ownerId: 'user-1', deletedAt: null, updatedAt: now, tags: [] };
      mockPrisma.memory.findUnique.mockResolvedValue(memory);
      mockOwnershipService.checkOwnership.mockReturnValue(undefined);
      mockPrisma.memory.update.mockResolvedValue(memory);
      // findByIdInternal calls findUnique again — return same memory
      mockMemoryRepo.findById.mockResolvedValue(memory);

      await expect(
        service.update('user-1', 'mem-1', {
          title: 'Updated Title',
          updatedAt: '2026-07-01T00:00:00.000Z',
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('delete', () => {
    it('should soft-delete an owned memory', async () => {
      const memory = { id: 'mem-1', ownerId: 'user-1', deletedAt: null, title: 'Test' };
      mockMemoryRepo.findById.mockResolvedValue(memory);
      mockOwnershipService.checkOwnership.mockReturnValue(undefined);
      mockMemoryRepo.softDelete.mockResolvedValue({ ...memory, deletedAt: new Date() });

      await service.delete('user-1', 'mem-1');
      expect(mockMemoryRepo.softDelete).toHaveBeenCalledWith('mem-1');
    });

    it('should throw NotFoundException when trying to delete already-deleted memory', async () => {
      const deletedMemory = { id: 'mem-1', ownerId: 'user-1', deletedAt: new Date() };
      mockMemoryRepo.findById.mockResolvedValue(deletedMemory);
      await expect(service.delete('user-1', 'mem-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMany — cursor pagination', () => {
    it('should return items and nextCursor when more pages exist', async () => {
      const records = [
        { id: 'mem-1', ownerId: 'user-1', tags: [], metadata: null },
        { id: 'mem-2', ownerId: 'user-1', tags: [], metadata: null },
        { id: 'mem-3', ownerId: 'user-1', tags: [], metadata: null }, // overflow signals hasNextPage
      ];
      mockPrisma.memory.findMany.mockResolvedValue(records);

      const result = await service.findMany('user-1', { limit: 2 });
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('mem-2');
    });

    it('should return empty result when no memories exist', async () => {
      mockPrisma.memory.findMany.mockResolvedValue([]);
      const result = await service.findMany('user-1', { limit: 20 });
      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });
  });
});
