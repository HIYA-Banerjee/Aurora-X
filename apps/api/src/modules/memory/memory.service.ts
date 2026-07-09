import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { MemoryRepository } from '../../repositories/MemoryRepository';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { MemoryQueryDto } from './dto/memory-query.dto';
import { OwnershipService } from '../../common/services/ownership.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MemoryService {
  constructor(
    private readonly memoryRepo: MemoryRepository,
    private readonly ownershipService: OwnershipService,
    private readonly prisma: PrismaService,
  ) {}

  async create(ownerId: string, dto: CreateMemoryDto) {
    // Run creation inside a transaction to ensure atomic MemoryTag link creations
    return await this.prisma.$transaction(async (tx) => {
      const memory = await tx.memory.create({
        data: {
          ownerId,
          title: dto.title,
          description: dto.description || null,
          eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
          location: dto.location || null,
          visibility: dto.visibility || 'PRIVATE',
          metadata: dto.metadata || {},
          archived: false,
        },
      });

      if (dto.tags && dto.tags.length > 0) {
        for (const tagName of dto.tags) {
          const cleanTagName = tagName.trim().toLowerCase();
          if (!cleanTagName) continue;

          const tag = await tx.tag.upsert({
            where: { name: cleanTagName },
            update: {},
            create: { name: cleanTagName },
          });

          await tx.memoryTag.create({
            data: {
              memoryId: memory.id,
              tagId: tag.id,
            },
          });
        }
      }

      return this.findByIdInternal(memory.id, tx);
    });
  }

  async findOne(ownerId: string, id: string, role?: string) {
    const memory = await this.memoryRepo.findById(id);
    if (!memory || memory.deletedAt) {
      throw new NotFoundException('Memory not found');
    }
    this.ownershipService.checkOwnership(memory, ownerId, role);
    return memory;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateMemoryDto,
    role?: string,
  ) {
    const memory = await this.prisma.memory.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!memory || memory.deletedAt) {
      throw new NotFoundException('Memory not found');
    }

    this.ownershipService.checkOwnership(memory, ownerId, role);

    // Optimistic Concurrency Check
    if (dto.updatedAt) {
      const dbTime = memory.updatedAt.toISOString();
      const clientTime = new Date(dto.updatedAt).toISOString();
      if (dbTime !== clientTime) {
        throw new ConflictException(
          'The resource was updated by another process. Please reload and try again.',
        );
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        title: dto.title,
        description: dto.description,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        location: dto.location,
        visibility: dto.visibility,
        metadata: dto.metadata || undefined,
      };

      await tx.memory.update({
        where: { id },
        data: updateData,
      });

      if (dto.tags !== undefined) {
        // Clear previous tags
        await tx.memoryTag.deleteMany({
          where: { memoryId: id },
        });

        // Add new tags
        for (const tagName of dto.tags) {
          const cleanTagName = tagName.trim().toLowerCase();
          if (!cleanTagName) continue;

          const tag = await tx.tag.upsert({
            where: { name: cleanTagName },
            update: {},
            create: { name: cleanTagName },
          });

          await tx.memoryTag.create({
            data: {
              memoryId: id,
              tagId: tag.id,
            },
          });
        }
      }

      return this.findByIdInternal(id, tx);
    });
  }

  async delete(ownerId: string, id: string, role?: string) {
    const memory = await this.memoryRepo.findById(id);
    if (!memory || memory.deletedAt) {
      throw new NotFoundException('Memory not found');
    }
    this.ownershipService.checkOwnership(memory, ownerId, role);
    await this.memoryRepo.softDelete(id);
  }

  async restore(ownerId: string, id: string, role?: string) {
    const memory = await this.prisma.memory.findUnique({
      where: { id },
    });
    if (!memory || !memory.deletedAt) {
      throw new NotFoundException('Soft-deleted memory not found');
    }
    this.ownershipService.checkOwnership(memory, ownerId, role);
    await this.memoryRepo.restore(id);
    return this.findOne(ownerId, id, role);
  }

  async hardDelete(id: string) {
    const memory = await this.prisma.memory.findUnique({ where: { id } });
    if (!memory) {
      throw new NotFoundException('Memory not found');
    }
    await this.memoryRepo.hardDelete(id);
  }

  async toggleFavorite(ownerId: string, id: string, role?: string) {
    const memory = await this.findOne(ownerId, id, role);
    const metadata = (memory.metadata as Record<string, any>) || {};
    metadata.favorite = !metadata.favorite;

    await this.memoryRepo.update(id, {
      metadata,
    });
    return this.findOne(ownerId, id, role);
  }

  async toggleArchive(ownerId: string, id: string, role?: string) {
    const memory = await this.prisma.memory.findUnique({ where: { id } });
    if (!memory || memory.deletedAt) {
      throw new NotFoundException('Memory not found');
    }
    this.ownershipService.checkOwnership(memory, ownerId, role);

    const isArchived = !memory.archived;
    await this.prisma.memory.update({
      where: { id },
      data: { archived: isArchived },
    });
    return this.findOne(ownerId, id, role);
  }

  async findMany(ownerId: string, query: MemoryQueryDto, role?: string) {
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

    const andFilters: any[] = [];

    if (query.favorite !== undefined) {
      andFilters.push({
        metadata: { path: ['favorite'], equals: query.favorite === 'true' },
      });
    }
    if (query.emotion !== undefined) {
      andFilters.push({
        metadata: { path: ['emotion'], equals: query.emotion },
      });
    }
    if (query.importance !== undefined) {
      andFilters.push({
        metadata: { path: ['importance'], equals: query.importance },
      });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tags) {
      const tagList = query.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (tagList.length > 0) {
        where.tags = {
          some: {
            tag: {
              name: {
                in: tagList,
              },
            },
          },
        };
      }
    }

    if (query.startDate || query.endDate) {
      where.eventDate = {};
      if (query.startDate) {
        where.eventDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.eventDate.lte = new Date(query.endDate);
      }
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.visibility) {
      where.visibility = query.visibility;
    }

    const records = await this.prisma.memory.findMany({
      where,
      take,
      cursor,
      skip,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        ownerId: true,
        title: true,
        description: true,
        eventDate: true,
        location: true,
        visibility: true,
        metadata: true,
        archived: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, limit) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    // Map tag objects to array of strings
    const mappedItems = items.map((item) => ({
      ...item,
      tags: item.tags.map((t) => t.tag.name),
      metadata: (item.metadata as Record<string, any>) || null,
    }));

    return {
      items: mappedItems,
      nextCursor,
    };
  }

  private async findByIdInternal(id: string, tx: any) {
    const item = await tx.memory.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        title: true,
        description: true,
        eventDate: true,
        location: true,
        visibility: true,
        metadata: true,
        archived: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!item) return null;

    return {
      ...item,
      tags: item.tags.map((t) => t.tag.name),
      metadata: (item.metadata as Record<string, any>) || null,
    };
  }
}
