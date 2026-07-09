import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { StoryRepository } from '../../repositories/StoryRepository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [StoryController],
  providers: [StoryService, StoryRepository],
  exports: [StoryService, StoryRepository],
})
export class StoryModule {}
