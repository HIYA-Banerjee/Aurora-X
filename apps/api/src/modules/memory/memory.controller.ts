import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MemoryService } from './memory.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { MemoryQueryDto } from './dto/memory-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserRecord } from '@aurora-x/shared-types';
import { API_PREFIX } from '../../common/constants';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Memories')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/memories`)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a new memory' })
  @ApiResponse({
    status: 201,
    description: 'Memory successfully created.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          ownerId: 'user-uuid-1234-5678',
          title: 'Summer Vacation in Paris',
          description: 'A wonderful week in Paris visiting the Louvre...',
          eventDate: '2026-07-08T00:00:00.000Z',
          location: 'Paris, France',
          visibility: 'PRIVATE',
          metadata: { favorite: true, emotion: 'happy', importance: 5 },
          archived: false,
          deletedAt: null,
          createdAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:00:00.000Z',
          tags: ['travel', 'vacation'],
        },
        timestamp: '2026-07-08T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() dto: CreateMemoryDto, @CurrentUser() user: UserRecord) {
    return this.memoryService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve memories list with cursor pagination and queries',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items to return (1-100)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor element ID for pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search text on title/description',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of memories.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
              ownerId: 'user-uuid-1234-5678',
              title: 'Summer Vacation in Paris',
              description: 'A wonderful week...',
              eventDate: '2026-07-08T00:00:00.000Z',
              location: 'Paris, France',
              visibility: 'PRIVATE',
              metadata: { favorite: true, emotion: 'happy', importance: 5 },
              archived: false,
              deletedAt: null,
              createdAt: '2026-07-08T12:00:00.000Z',
              updatedAt: '2026-07-08T12:00:00.000Z',
              tags: ['travel', 'vacation'],
            },
          ],
          nextCursor: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        },
        timestamp: '2026-07-08T12:00:05.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() query: MemoryQueryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.memoryService.findMany(user.id, query, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single memory by ID' })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiResponse({
    status: 200,
    description: 'Memory details retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          ownerId: 'user-uuid-1234-5678',
          title: 'Summer Vacation in Paris',
          description: 'A wonderful week...',
          eventDate: '2026-07-08T00:00:00.000Z',
          location: 'Paris, France',
          visibility: 'PRIVATE',
          metadata: { favorite: true },
          archived: false,
          deletedAt: null,
          createdAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:00:00.000Z',
          tags: ['travel'],
        },
        timestamp: '2026-07-08T12:00:10Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You do not own this memory.',
  })
  @ApiResponse({ status: 404, description: 'Memory not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.memoryService.findOne(user.id, id, user.role);
  }

  @Patch(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update a memory with optimistic concurrency checks',
  })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiResponse({
    status: 200,
    description: 'Memory successfully updated.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          ownerId: 'user-uuid-1234-5678',
          title: 'Summer Vacation in Paris (Updated)',
          description: 'Updated description...',
          eventDate: '2026-07-08T00:00:00.000Z',
          location: 'Paris, France',
          visibility: 'PRIVATE',
          metadata: { favorite: true },
          archived: false,
          deletedAt: null,
          createdAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:05:00.000Z',
          tags: ['travel'],
        },
        timestamp: '2026-07-08T12:05:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You do not own this memory.',
  })
  @ApiResponse({ status: 404, description: 'Memory not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Stale update detected (optimistic locking failed).',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMemoryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.memoryService.update(user.id, id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Delete a memory (soft delete for users, supports hard delete for admin)',
  })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiQuery({
    name: 'hard',
    required: false,
    description: 'Perform hard delete (ADMIN only)',
  })
  @ApiResponse({ status: 200, description: 'Memory deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Owner mismatch or hard delete by non-admin.',
  })
  @ApiResponse({ status: 404, description: 'Memory not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
    @Query('hard') hard?: string,
  ) {
    if (hard === 'true') {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Access denied: Hard delete requires ADMIN role',
        );
      }
      await this.memoryService.hardDelete(id);
      return { success: true, message: 'Memory hard deleted successfully' };
    }
    await this.memoryService.delete(user.id, id, user.role);
    return { success: true, message: 'Memory soft deleted successfully' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted memory' })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiResponse({ status: 200, description: 'Memory successfully restored.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Forbidden access.' })
  @ApiResponse({ status: 404, description: 'Soft-deleted memory not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.memoryService.restore(user.id, id, user.role);
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status' })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiResponse({
    status: 200,
    description: 'Favorite status toggled successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Forbidden access.' })
  @ApiResponse({ status: 404, description: 'Memory not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async toggleFavorite(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.memoryService.toggleFavorite(user.id, id, user.role);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Toggle archived status' })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiResponse({
    status: 200,
    description: 'Archived status toggled successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Forbidden access.' })
  @ApiResponse({ status: 404, description: 'Memory not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async toggleArchive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.memoryService.toggleArchive(user.id, id, user.role);
  }
}
