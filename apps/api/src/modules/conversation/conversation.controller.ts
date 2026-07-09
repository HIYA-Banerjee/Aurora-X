import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
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

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/conversations`)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Start a new conversation session' })
  @ApiResponse({
    status: 201,
    description: 'Conversation successfully started or existing returned.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
          ownerId: 'user-uuid-1234-5678',
          participantId: 'user-uuid-9999-9999',
          createdAt: '2026-07-08T12:00:00.000Z',
        },
        timestamp: '2026-07-08T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot start conversation with yourself.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.conversationService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve conversation sessions list' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of conversations.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
              ownerId: 'user-uuid-1234-5678',
              participantId: 'user-uuid-9999-9999',
              createdAt: '2026-07-08T12:00:00.000Z',
              owner: { id: 'user-uuid-1234', email: 'owner@example.com' },
              participant: {
                id: 'user-uuid-9999',
                email: 'ai-bot@example.com',
              },
            },
          ],
          nextCursor: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
        },
        timestamp: '2026-07-08T12:00:05.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() query: ConversationQueryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.conversationService.findMany(user.id, query, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a conversation session' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation details retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
          ownerId: 'user-uuid-1234-5678',
          participantId: 'user-uuid-9999-9999',
          createdAt: '2026-07-08T12:00:00.000Z',
          owner: { id: 'user-uuid-1234', email: 'owner@example.com' },
          participant: { id: 'user-uuid-9999', email: 'ai-bot@example.com' },
        },
        timestamp: '2026-07-08T12:00:10.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Owner/Participant mismatch.',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.conversationService.findOne(user.id, id, user.role);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a conversation session and all its messages',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    await this.conversationService.delete(user.id, id, user.role);
    return {
      success: true,
      message: 'Conversation session deleted successfully',
    };
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Add a chat message to a conversation session' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 201,
    description: 'Message successfully created.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          conversationId: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
          role: 'user',
          content: 'Hello! Can you summarize my memories from yesterday?',
          tokenUsage: 45,
          model: 'gpt-4o',
          createdAt: '2026-07-08T12:00:15.000Z',
        },
        timestamp: '2026-07-08T12:00:15.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async addMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.conversationService.addMessage(user.id, id, dto, user.role);
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Retrieve paginated messages for a conversation session',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of messages.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
              conversationId: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
              role: 'user',
              content: 'Hello! Can you summarize...',
              tokenUsage: 45,
              model: 'gpt-4o',
              createdAt: '2026-07-08T12:00:15.000Z',
            },
          ],
          nextCursor: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        },
        timestamp: '2026-07-08T12:00:20.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getMessages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: MessageQueryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.conversationService.getMessages(user.id, id, query, user.role);
  }

  @Delete(':id/messages/:messageId')
  @ApiOperation({
    summary: 'Delete a single message by ID inside a conversation session',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiParam({ name: 'messageId', description: 'Message UUID' })
  @ApiResponse({ status: 200, description: 'Message successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Conversation or message not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @CurrentUser() user: UserRecord,
  ) {
    await this.conversationService.deleteMessage(
      user.id,
      id,
      messageId,
      user.role,
    );
    return { success: true, message: 'Message deleted successfully' };
  }
}
