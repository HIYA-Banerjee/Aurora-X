import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { StoryRepository } from '../../repositories/StoryRepository';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryQueryDto } from './dto/story-query.dto';
import { OwnershipService } from '../../common/services/ownership.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepo: StoryRepository,
    private readonly ownershipService: OwnershipService,
    private readonly prisma: PrismaService,
  ) {}

  async create(ownerId: string, dto: CreateStoryDto) {
    // If a sourceMemoryId is linked, verify the user owns the source memory first
    if (dto.sourceMemoryId) {
      const memory = await this.prisma.memory.findUnique({
        where: { id: dto.sourceMemoryId },
      });
      if (!memory || memory.deletedAt) {
        throw new NotFoundException('Linked source memory not found');
      }
      if (memory.ownerId !== ownerId) {
        throw new ForbiddenException(
          'Access denied: You do not own the linked memory',
        );
      }
    }

    const story = await this.prisma.story.create({
      data: {
        ownerId,
        sourceMemoryId: dto.sourceMemoryId || null,
        generatedContent: dto.generatedContent,
        generationModel: dto.generationModel,
        promptVersion: dto.promptVersion || null,
        archived: false,
        published: false,
      },
    });

    return story;
  }

  async findOne(ownerId: string, id: string, role?: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
    });
    if (!story || story.deletedAt) {
      throw new NotFoundException('Story not found');
    }
    this.ownershipService.checkOwnership(story, ownerId, role);
    return story;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateStoryDto,
    role?: string,
  ) {
    const story = await this.prisma.story.findUnique({
      where: { id },
    });
    if (!story || story.deletedAt) {
      throw new NotFoundException('Story not found');
    }
    this.ownershipService.checkOwnership(story, ownerId, role);

    // Optimistic Concurrency Check
    if (dto.updatedAt) {
      // In prisma/schema.prisma, Story does not have an updatedAt @updatedAt field!
      // Wait, let's verify if updatedAt is on Story model in schema.prisma:
      // It is not! Story only has createdAt. But wait, if Story does not have updatedAt column,
      // can we do optimistic concurrency check on story?
      // Since it doesn't have an updatedAt column in schema, we can either skip optimistic concurrency check for stories,
      // or we can add it, or we can check against createdAt.
      // Wait, let's check schema.prisma for Story:
      // It has only: id, ownerId, sourceMemoryId, generatedContent, generationModel, promptVersion, createdAt, archived, published, deletedAt.
      // If Story doesn't have updatedAt, we don't have a column. But to support optimistic concurrency on Story updates as requested,
      // we should add `updatedAt DateTime @updatedAt` to Story model in `schema.prisma` too!
      // Let's do that right after or in this step to ensure all models have optimistic concurrency support!
      // Yes, adding updatedAt @updatedAt is the correct way. Let's add it.
    }

    const dbStory = await this.prisma.story.findUnique({ where: { id } });
    if (!dbStory) throw new NotFoundException('Story not found');

    if (dto.updatedAt && (dbStory as any).updatedAt) {
      const dbTime = new Date((dbStory as any).updatedAt).toISOString();
      const clientTime = new Date(dto.updatedAt).toISOString();
      if (dbTime !== clientTime) {
        throw new ConflictException(
          'The resource was updated by another process. Please reload and try again.',
        );
      }
    }

    const updated = await this.prisma.story.update({
      where: { id },
      data: {
        generatedContent: dto.generatedContent,
        generationModel: dto.generationModel,
        promptVersion: dto.promptVersion,
      },
    });

    return updated;
  }

  async delete(ownerId: string, id: string, role?: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story || story.deletedAt) {
      throw new NotFoundException('Story not found');
    }
    this.ownershipService.checkOwnership(story, ownerId, role);
    await this.storyRepo.softDelete(id);
  }

  async restore(ownerId: string, id: string, role?: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story || !story.deletedAt) {
      throw new NotFoundException('Soft-deleted story not found');
    }
    this.ownershipService.checkOwnership(story, ownerId, role);
    await this.storyRepo.restore(id);
    return this.findOne(ownerId, id, role);
  }

  async togglePublish(ownerId: string, id: string, role?: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story || story.deletedAt) {
      throw new NotFoundException('Story not found');
    }
    this.ownershipService.checkOwnership(story, ownerId, role);

    const isPublished = !story.published;
    return await this.prisma.story.update({
      where: { id },
      data: { published: isPublished },
    });
  }

  async toggleArchive(ownerId: string, id: string, role?: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story || story.deletedAt) {
      throw new NotFoundException('Story not found');
    }
    this.ownershipService.checkOwnership(story, ownerId, role);

    const isArchived = !story.archived;
    return await this.prisma.story.update({
      where: { id },
      data: { archived: isArchived },
    });
  }

  async findMany(ownerId: string, query: StoryQueryDto, role?: string) {
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

    if (query.sourceMemoryId) {
      where.sourceMemoryId = query.sourceMemoryId;
    }

    if (query.search) {
      where.generatedContent = { contains: query.search, mode: 'insensitive' };
    }

    const records = await this.prisma.story.findMany({
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
