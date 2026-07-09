import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditRepository } from '../../repositories/AuditRepository';
import { AuditQueryDto } from './dto/audit-query.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepo: AuditRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: { select: { id: true, email: true, displayName: true } },
      },
    });
    if (!log) {
      throw new NotFoundException('Audit log entry not found');
    }
    return log;
  }

  async findMany(query: AuditQueryDto) {
    const limit = query.limit || 20;
    const take = limit + 1;
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const skip = query.cursor ? 1 : 0;

    const where: any = {};

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.entity) {
      where.entity = { contains: query.entity, mode: 'insensitive' };
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const records = await this.prisma.auditLog.findMany({
      where,
      take,
      cursor,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, email: true, displayName: true } },
      },
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
