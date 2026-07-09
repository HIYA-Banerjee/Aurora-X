import { Injectable, NotFoundException } from '@nestjs/common';
import { RecommendationRepository } from '../../repositories/RecommendationRepository';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';
import { OwnershipService } from '../../common/services/ownership.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly recommendationRepo: RecommendationRepository,
    private readonly ownershipService: OwnershipService,
    private readonly prisma: PrismaService,
  ) {}

  async findOne(userId: string, id: string, role?: string) {
    const rec = await this.prisma.recommendation.findUnique({
      where: { id },
    });
    if (!rec) {
      throw new NotFoundException('Recommendation not found');
    }
    this.ownershipService.checkOwnership(rec, userId, role);
    return rec;
  }

  async findMany(userId: string, query: RecommendationQueryDto, role?: string) {
    const limit = query.limit || 20;
    const take = limit + 1;
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const skip = query.cursor ? 1 : 0;

    const where: any = {};
    if (role !== 'ADMIN' && role !== 'SYSTEM') {
      where.userId = userId;
    }

    const records = await this.prisma.recommendation.findMany({
      where,
      take,
      cursor,
      skip,
      orderBy: { generatedAt: 'desc' },
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
