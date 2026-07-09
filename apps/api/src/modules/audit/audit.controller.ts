import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { API_PREFIX } from '../../common/constants';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller(`${API_PREFIX}/audit-logs`)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve workspace audit logs (ADMIN only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items to return (1-100)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Pagination cursor ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of audit logs.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
              actorId: 'user-uuid-1234-5678',
              action: 'CREATE',
              entity: 'Memory',
              entityId: 'memory-uuid-1234',
              payload: { title: 'Summer Vacation' },
              createdAt: '2026-07-08T12:00:00.000Z',
              actor: {
                id: 'user-uuid-1234',
                email: 'admin@example.com',
                displayName: 'Admin',
              },
            },
          ],
          nextCursor: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
        },
        timestamp: '2026-07-08T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an audit log entry (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Audit log UUID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log details retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
          actorId: 'user-uuid-1234-5678',
          action: 'CREATE',
          entity: 'Memory',
          entityId: 'memory-uuid-1234',
          payload: { title: 'Summer Vacation' },
          createdAt: '2026-07-08T12:00:00.000Z',
          actor: {
            id: 'user-uuid-1234',
            email: 'admin@example.com',
            displayName: 'Admin',
          },
        },
        timestamp: '2026-07-08T12:00:05.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  @ApiResponse({ status: 404, description: 'Audit log entry not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.auditService.findOne(id);
  }
}
