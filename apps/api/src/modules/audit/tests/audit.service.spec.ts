import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit.service';
import { AuditRepository } from '../../../repositories/AuditRepository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockAuditRepo = {};

const mockPrisma = {
  auditLog: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditRepository, useValue: mockAuditRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when audit log does not exist', async () => {
      mockPrisma.auditLog.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should return audit log when found', async () => {
      const log = {
        id: 'log-1',
        actorId: 'user-1',
        action: 'CREATE',
        entity: 'Memory',
        entityId: 'mem-1',
        createdAt: new Date(),
        actor: { id: 'user-1', email: 'admin@test.com', displayName: 'Admin' },
      };
      mockPrisma.auditLog.findUnique.mockResolvedValue(log);
      const result = await service.findOne('log-1');
      expect(result).toEqual(log);
    });
  });

  describe('findMany', () => {
    it('should filter by actorId when provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      await service.findMany({ actorId: 'user-1', limit: 20 });
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ actorId: 'user-1' }),
        }),
      );
    });

    it('should filter by date range when startDate and endDate are provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      await service.findMany({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        limit: 20,
      });
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should return cursor-paginated results', async () => {
      const records = [
        { id: 'log-1', action: 'CREATE' },
        { id: 'log-2', action: 'DELETE' },
        { id: 'log-3', action: 'UPDATE' }, // overflow
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(records);

      const result = await service.findMany({ limit: 2 });
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('log-2');
    });
  });
});
