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
  ParseUUIDPipe,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryQueryDto } from './dto/story-query.dto';
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

@ApiTags('Stories')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/stories`)
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a new story' })
  @ApiResponse({
    status: 201,
    description: 'Story successfully created.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '8a8b8c8d-8e8f-8a8b-8c8d-8e8f8a8b8c8d',
          ownerId: 'user-uuid-1234-5678',
          sourceMemoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          generatedContent:
            'Once upon a time in Paris, we walked under the Eiffel Tower...',
          generationModel: 'gpt-4o',
          promptVersion: 'v1.2',
          archived: false,
          published: false,
          deletedAt: null,
          createdAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:00:00.000Z',
        },
        timestamp: '2026-07-08T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Linked memory not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() dto: CreateStoryDto, @CurrentUser() user: UserRecord) {
    return this.storyService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve stories with cursor pagination and search',
  })
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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search text on generated content',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of stories.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: '8a8b8c8d-8e8f-8a8b-8c8d-8e8f8a8b8c8d',
              ownerId: 'user-uuid-1234-5678',
              sourceMemoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
              generatedContent: 'Once upon a time...',
              generationModel: 'gpt-4o',
              promptVersion: 'v1.2',
              archived: false,
              published: false,
              deletedAt: null,
              createdAt: '2026-07-08T12:00:00.000Z',
              updatedAt: '2026-07-08T12:00:00.000Z',
            },
          ],
          nextCursor: '8a8b8c8d-8e8f-8a8b-8c8d-8e8f8a8b8c8d',
        },
        timestamp: '2026-07-08T12:00:05.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() query: StoryQueryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.storyService.findMany(user.id, query, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a story by ID' })
  @ApiParam({ name: 'id', description: 'Story UUID' })
  @ApiResponse({
    status: 200,
    description: 'Story details retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '8a8b8c8d-8e8f-8a8b-8c8d-8e8f8a8b8c8d',
          ownerId: 'user-uuid-1234-5678',
          sourceMemoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          generatedContent: 'Once upon a time...',
          generationModel: 'gpt-4o',
          promptVersion: 'v1.2',
          archived: false,
          published: false,
          deletedAt: null,
          createdAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:00:00.000Z',
        },
        timestamp: '2026-07-08T12:00:10.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Owner mismatch.' })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.storyService.findOne(user.id, id, user.role);
  }

  @Patch(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Update story details' })
  @ApiParam({ name: 'id', description: 'Story UUID' })
  @ApiResponse({
    status: 200,
    description: 'Story updated successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '8a8b8c8d-8e8f-8a8b-8c8d-8e8f8a8b8c8d',
          ownerId: 'user-uuid-1234-5678',
          sourceMemoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          generatedContent: 'Updated story content...',
          generationModel: 'gpt-4o',
          promptVersion: 'v1.3',
          archived: false,
          published: false,
          deletedAt: null,
          createdAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:05:00.000Z',
        },
        timestamp: '2026-07-08T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Owner mismatch.' })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Optimistic locking check failed.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStoryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.storyService.update(user.id, id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a story' })
  @ApiParam({ name: 'id', description: 'Story UUID' })
  @ApiResponse({ status: 200, description: 'Story soft deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Owner mismatch.' })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    await this.storyService.delete(user.id, id, user.role);
    return { success: true, message: 'Story soft deleted successfully' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted story' })
  @ApiParam({ name: 'id', description: 'Story UUID' })
  @ApiResponse({ status: 200, description: 'Story restored successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Soft-deleted story not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.storyService.restore(user.id, id, user.role);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Toggle published status' })
  @ApiParam({ name: 'id', description: 'Story UUID' })
  @ApiResponse({
    status: 200,
    description: 'Story publish status toggled successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async togglePublish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.storyService.togglePublish(user.id, id, user.role);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Toggle archived status' })
  @ApiParam({ name: 'id', description: 'Story UUID' })
  @ApiResponse({
    status: 200,
    description: 'Story archived status toggled successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async toggleArchive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.storyService.toggleArchive(user.id, id, user.role);
  }
}
