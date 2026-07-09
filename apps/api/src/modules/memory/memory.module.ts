import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';
import { MemoryRepository } from '../../repositories/MemoryRepository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [MemoryController],
  providers: [MemoryService, MemoryRepository],
  exports: [MemoryService, MemoryRepository],
})
export class MemoryModule {}
