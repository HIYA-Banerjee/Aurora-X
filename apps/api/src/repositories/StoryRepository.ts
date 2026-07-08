import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Story as PrismaStory, Prisma } from '@prisma/client';
import { CreateStoryInput, UpdateStoryInput } from '@aurora-x/shared-types';

@Injectable()
export class StoryRepository extends BaseRepository<
  PrismaStory,
  CreateStoryInput,
  UpdateStoryInput,
  Prisma.StoryFindUniqueArgs,
  Prisma.StoryFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'story');
  }
}
