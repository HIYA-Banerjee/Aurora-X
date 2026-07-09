import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationRepository } from '../../repositories/RecommendationRepository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationRepository],
  exports: [RecommendationService, RecommendationRepository],
})
export class RecommendationModule {}
