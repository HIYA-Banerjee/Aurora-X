import { Test, TestingModule } from '@nestjs/testing';
import { HealthController, DatabaseHealthIndicator } from '../health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

const mockHealthCheckService = {
  check: jest.fn(),
};

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;
  let dbIndicator: DatabaseHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        DatabaseHealthIndicator,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    dbIndicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
    jest.clearAllMocks();
  });

  describe('GET /ready', () => {
    it('should return ready status with uptime and timestamp', () => {
      const result = controller.ready();
      expect(result.status).toBe('ready');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('DatabaseHealthIndicator', () => {
    it('should return status up when DB query succeeds', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await dbIndicator.isHealthy('database');
      expect(result.database.status).toBe('up');
    });

    it('should return status down when DB query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));
      const result = await dbIndicator.isHealthy('database');
      expect(result.database.status).toBe('down');
    });
  });
});
