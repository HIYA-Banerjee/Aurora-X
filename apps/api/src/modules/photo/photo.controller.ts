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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Redirect,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoQueryDto } from './dto/photo-query.dto';
import { PhotoMetadataDto } from './dto/photo-metadata.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserRecord } from '@aurora-x/shared-types';
import { API_PREFIX } from '../../common/constants';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Photos')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/photos`)
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and optimize a new photo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (MIME type image/*, size < 5MB)',
        },
        memoryId: {
          type: 'string',
          description: 'Optional Memory UUID to associate this photo with',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Photo successfully uploaded and optimized.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
          ownerId: 'user-uuid-1234-5678',
          width: 1920,
          height: 1080,
          mimeType: 'image/jpeg',
          fileSize: 450000,
          storageKey: 'photos/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e.jpg',
          memoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          uploadedAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:00:00.000Z',
        },
        timestamp: '2026-07-08T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'File size too large (>5MB) or invalid image MIME type.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('memoryId') memoryId: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.photoService.uploadPhoto(user.id, file, memoryId);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve photos list with cursor pagination and memory filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of photos.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
              ownerId: 'user-uuid-1234-5678',
              width: 1920,
              height: 1080,
              mimeType: 'image/jpeg',
              fileSize: 450000,
              storageKey: 'photos/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e.jpg',
              memoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
              uploadedAt: '2026-07-08T12:00:00.000Z',
              updatedAt: '2026-07-08T12:00:00.000Z',
            },
          ],
          nextCursor: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        },
        timestamp: '2026-07-08T12:00:05.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() query: PhotoQueryDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.photoService.findMany(user.id, query, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get photo metadata and its secure access URL' })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  @ApiResponse({
    status: 200,
    description: 'Photo details and url retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          photo: {
            id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
            ownerId: 'user-uuid-1234-5678',
            width: 1920,
            height: 1080,
            mimeType: 'image/jpeg',
            fileSize: 450000,
            storageKey: 'photos/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e.jpg',
            memoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
            uploadedAt: '2026-07-08T12:00:00.000Z',
            updatedAt: '2026-07-08T12:00:00.000Z',
          },
          url: 'https://aurora-x-assets.s3.amazonaws.com/photos/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e.jpg?AWSAccessKeyId=...',
        },
        timestamp: '2026-07-08T12:00:10.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Owner mismatch.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    const photo = await this.photoService.findOne(user.id, id, user.role);
    const url = await this.photoService.getSignedUrl(user.id, id, user.role);
    return { photo, url };
  }

  @Get(':id/thumbnail')
  @ApiOperation({
    summary: 'Get a temporary secure link to download the thumbnail version',
  })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  @ApiResponse({
    status: 200,
    description: 'Thumbnail secure url retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          url: 'https://aurora-x-assets.s3.amazonaws.com/thumbnails/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e-thumb.webp?AWSAccessKeyId=...',
        },
        timestamp: '2026-07-08T12:00:15.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getThumbnail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    const url = await this.photoService.getThumbnailUrl(user.id, id, user.role);
    return { url };
  }

  @Patch(':id/metadata')
  @ApiOperation({
    summary:
      'Update photo dimensions, mime type, or memory association details',
  })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  @ApiResponse({
    status: 200,
    description: 'Photo metadata updated successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
          ownerId: 'user-uuid-1234-5678',
          width: 800,
          height: 600,
          mimeType: 'image/png',
          fileSize: 102400,
          storageKey: 'photos/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e.png',
          memoryId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          uploadedAt: '2026-07-08T12:00:00.000Z',
          updatedAt: '2026-07-08T12:05:00.000Z',
        },
        timestamp: '2026-07-08T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateMetadata(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PhotoMetadataDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.photoService.updateMetadata(user.id, id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a photo' })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  @ApiResponse({ status: 200, description: 'Photo soft deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    await this.photoService.delete(user.id, id, user.role);
    return { success: true, message: 'Photo soft deleted successfully' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted photo' })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  @ApiResponse({ status: 200, description: 'Photo successfully restored.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Soft-deleted photo not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserRecord,
  ) {
    return this.photoService.restore(user.id, id, user.role);
  }
}
