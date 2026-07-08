import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { PrismaService } from '../modules/prisma/prisma.service';
import { AuditLog as PrismaAuditLog, Prisma } from '@prisma/client';
import { CreateAuditLogInput } from '@aurora-x/shared-types';

@Injectable()
export class AuditRepository extends BaseRepository<
  PrismaAuditLog,
  CreateAuditLogInput,
  never,
  Prisma.AuditLogFindUniqueArgs,
  Prisma.AuditLogFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'auditLog');
  }

  // Additional audit‑specific queries can be added here
}
