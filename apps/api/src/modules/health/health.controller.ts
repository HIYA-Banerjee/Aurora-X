import { Controller, Get, Injectable } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { PublicRoute } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch {
      return this.getStatus(key, false, { message: 'Database unreachable' });
    }
  }
}

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbIndicator: DatabaseHealthIndicator,
  ) {}

  @Get('health')
  @PublicRoute()
  @HealthCheck()
  @ApiOperation({ summary: 'Full application health check' })
  @ApiResponse({
    status: 200,
    description: 'All health indicators are healthy.',
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'One or more health indicators are unhealthy.',
  })
  async check() {
    return this.health.check([() => this.dbIndicator.isHealthy('database')]);
  }

  @Get('ready')
  @PublicRoute()
  @ApiOperation({
    summary: 'Readiness probe — confirms API is ready to serve traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'API is ready.',
    schema: {
      example: {
        status: 'ready',
        timestamp: '2026-07-09T07:00:00.000Z',
        uptime: 42.5,
      },
    },
  })
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
