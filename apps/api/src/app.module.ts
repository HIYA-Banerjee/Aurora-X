import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MemoryModule } from './modules/memory/memory.module';
import { StoryModule } from './modules/story/story.module';
import { PhotoModule } from './modules/photo/photo.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      ignoreEnvFile: false,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    MemoryModule,
    StoryModule,
    PhotoModule,
    ConversationModule,
    RecommendationModule,
    AuditModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
