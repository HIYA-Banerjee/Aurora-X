import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Recommendation as PrismaRecommendation, Prisma } from '@prisma/client';
import { CreateRecommendationInput } from '@aurora-x/shared-types';

@Injectable()
export class RecommendationRepository extends BaseRepository<
  PrismaRecommendation,
  CreateRecommendationInput,
  never,
  Prisma.RecommendationFindUniqueArgs,
  Prisma.RecommendationFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'recommendation');
  }

  // Additional recommendation‑specific queries can be added here
}
