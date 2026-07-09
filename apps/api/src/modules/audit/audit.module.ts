import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from '../../repositories/AuditRepository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
