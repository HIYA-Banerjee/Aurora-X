import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthMetricsService } from './services/auth-metrics.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../../repositories/UserRepository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('THROTTLER_TTL') || 60) * 1000, // converted to milliseconds in modern NestJS throttler versions
          limit: config.get<number>('THROTTLER_LIMIT') || 10,
        },
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthMetricsService,
    JwtStrategy,
    UserRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, AuthMetricsService, UserRepository],
})
export class AuthModule {}
