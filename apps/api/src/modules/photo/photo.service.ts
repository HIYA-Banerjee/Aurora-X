import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import type { StorageProvider } from './interfaces/storage-provider.interface';
import { PhotoMetadataDto } from './dto/photo-metadata.dto';
import { PhotoQueryDto } from './dto/photo-query.dto';
import { OwnershipService } from '../../common/services/ownership.service';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class PhotoService {
  constructor(
    private readonly photoRepo: PhotoRepository,
    @Inject('StorageProvider')
    private readonly storageProvider: StorageProvider,
    private readonly ownershipService: OwnershipService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadPhoto(
    ownerId: string,
    file: Express.Multer.File,
    memoryId?: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload payload');
    }

    // Enforce 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds the 5MB limit');
    }

    // Verify image mime type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const uuid = randomUUID();
    const ext = path.extname(file.originalname) || '.jpg';
    const originalKey = `photos/${uuid}${ext}`;
    const thumbnailKey = `thumbnails/${uuid}-thumb.webp`;

    let optimizedBuffer: Buffer;
    let thumbnailBuffer: Buffer;
    let metadata: sharp.Metadata;

    try {
      const image = sharp(file.buffer);
      metadata = await image.metadata();

      optimizedBuffer = await image
        .resize({
          width: 1920,
          height: 1080,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();

      thumbnailBuffer = await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 75 })
        .toBuffer();
    } catch (err: any) {
      throw new BadRequestException(
        `Image optimization failed: ${err.message}`,
      );
    }

    // Upload to storage
    let originalUrl = '';
    let thumbnailUrl = '';
    try {
      originalUrl = await this.storageProvider.uploadFile(
        optimizedBuffer,
        originalKey,
        'image/jpeg',
      );
      thumbnailUrl = await this.storageProvider.uploadFile(
        thumbnailBuffer,
        thumbnailKey,
        'image/webp',
      );
    } catch (err: any) {
      try {
        if (originalUrl) await this.storageProvider.deleteFile(originalKey);
        if (thumbnailUrl) await this.storageProvider.deleteFile(thumbnailKey);
      } catch (delErr) {
        // Ignore deletion errors during rollback
      }
      throw new BadRequestException(
        `File storage upload failed: ${err.message}`,
      );
    }

    // Save database record with transaction rollback cleanup
    try {
      const photo = await this.prisma.photo.create({
        data: {
          id: uuid,
          ownerId,
          memoryId: memoryId || null,
          width: metadata.width || null,
          height: metadata.height || null,
          mimeType: 'image/jpeg',
          fileSize: optimizedBuffer.length,
          storageKey: originalKey,
        },
      });
      return photo;
    } catch (dbErr: any) {
      try {
        await this.storageProvider.deleteFile(originalKey);
        await this.storageProvider.deleteFile(thumbnailKey);
      } catch (delErr) {
        console.error('Failed to rollback uploaded files:', delErr);
      }
      throw dbErr;
    }
  }

  async findOne(ownerId: string, id: string, role?: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
    });
    if (!photo || photo.deletedAt) {
      throw new NotFoundException('Photo not found');
    }
    this.ownershipService.checkOwnership(photo, ownerId, role);
    return photo;
  }

  async getSignedUrl(ownerId: string, id: string, role?: string) {
    const photo = await this.findOne(ownerId, id, role);
    if (!photo.storageKey) {
      throw new BadRequestException('Photo has no storage path associated');
    }
    return this.storageProvider.getSignedUrl(photo.storageKey);
  }

  async getThumbnailUrl(ownerId: string, id: string, role?: string) {
    const photo = await this.findOne(ownerId, id, role);
    const thumbnailKey = `thumbnails/${photo.id}-thumb.webp`;
    return this.storageProvider.getSignedUrl(thumbnailKey);
  }

  async updateMetadata(
    ownerId: string,
    id: string,
    dto: PhotoMetadataDto,
    role?: string,
  ) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo || photo.deletedAt) {
      throw new NotFoundException('Photo not found');
    }
    this.ownershipService.checkOwnership(photo, ownerId, role);

    return await this.prisma.photo.update({
      where: { id },
      data: {
        width: dto.width,
        height: dto.height,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        memoryId: dto.memoryId,
      },
    });
  }

  async delete(ownerId: string, id: string, role?: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo || photo.deletedAt) {
      throw new NotFoundException('Photo not found');
    }
    this.ownershipService.checkOwnership(photo, ownerId, role);
    await this.photoRepo.softDelete(id);
  }

  async restore(ownerId: string, id: string, role?: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo || !photo.deletedAt) {
      throw new NotFoundException('Soft-deleted photo not found');
    }
    this.ownershipService.checkOwnership(photo, ownerId, role);
    await this.photoRepo.restore(id);
    return this.findOne(ownerId, id, role);
  }

  async findMany(ownerId: string, query: PhotoQueryDto, role?: string) {
    const limit = query.limit || 20;
    const take = limit + 1;
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const skip = query.cursor ? 1 : 0;

    const where: any = {
      ownerId: role === 'ADMIN' || role === 'SYSTEM' ? undefined : ownerId,
      deletedAt: null,
    };

    if (query.archived !== undefined) {
      where.archived = query.archived === 'true';
    }

    if (query.memoryId) {
      where.memoryId = query.memoryId;
    }

    const records = await this.prisma.photo.findMany({
      where,
      take,
      cursor,
      skip,
      orderBy: { id: 'asc' },
    });

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, limit) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
    };
  }
}
