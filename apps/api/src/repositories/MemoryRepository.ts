import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Memory as PrismaMemory, Prisma } from '@prisma/client';
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  MemoryRecord,
} from '@aurora-x/shared-types';

@Injectable()
export class MemoryRepository extends BaseRepository<
  PrismaMemory,
  CreateMemoryInput,
  UpdateMemoryInput,
  Prisma.MemoryFindUniqueArgs,
  Prisma.MemoryFindManyArgs,
  MemoryRecord
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'memory');
  }

  async addTag(memoryId: string, tagId: string): Promise<void> {
    await this.prisma.memoryTag.create({
      data: { memoryId, tagId },
    });
  }

  async removeTag(memoryId: string, tagId: string): Promise<void> {
    await this.prisma.memoryTag.delete({
      where: {
        memoryId_tagId: { memoryId, tagId },
      },
    });
  }
}
