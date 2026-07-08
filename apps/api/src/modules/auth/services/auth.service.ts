import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../repositories/UserRepository';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthMetricsService } from './auth-metrics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRecord } from '@aurora-x/shared-types';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly metrics: AuthMetricsService,
  ) {}

  async register(dto: RegisterDto, requestId: string): Promise<UserRecord> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Create user record using UserRepository
    const createdRecord = await this.userRepository.create({
      email,
      displayName: dto.displayName,
    });

    // Populate auth fields on the newly created user
    await this.userRepository.updateAuthFields(createdRecord.id, {
      passwordHash,
    });

    // Log the event asynchronously (non-blocking)
    this.createAuditLog(
      createdRecord.id,
      'CREATE',
      'User',
      createdRecord.id,
      { event: 'REGISTER', email: createdRecord.email },
      requestId,
    );

    return createdRecord;
  }

  async login(
    dto: LoginDto,
    requestId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findRawByEmail(
      dto.email.toLowerCase().trim(),
    );
    if (!user) {
      this.metrics.incrementLoginFailure();
      this.createAuditLog(
        null,
        'READ',
        'Auth',
        null,
        { event: 'LOGIN_FAILED', email: dto.email, reason: 'User not found' },
        requestId,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account lockout
    if (user.lockedUntil) {
      if (user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / 60000,
        );
        throw new ForbiddenException(
          `Account is locked. Try again in ${remainingTime} minutes.`,
        );
      } else {
        // Lockout expired, reset failed attempts locally for this login attempt context
        user.failedLoginAttempts = 0;
      }
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Authentication not configured for this user',
      );
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      this.metrics.incrementLoginFailure();

      const maxAttempts =
        this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;
      const lockoutMinutes =
        this.configService.get<number>('ACCOUNT_LOCK_MINUTES') || 15;
      const newFailedAttempts = user.failedLoginAttempts + 1;

      let lockedUntil: Date | null = null;
      if (newFailedAttempts >= maxAttempts) {
        lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        this.metrics.incrementAccountLockout();
        this.createAuditLog(
          user.id,
          'UPDATE',
          'User',
          user.id,
          { event: 'ACCOUNT_LOCKOUT', email: user.email },
          requestId,
        );
      }

      await this.userRepository.updateAuthFields(user.id, {
        failedLoginAttempts: newFailedAttempts,
        lockedUntil,
      });

      this.createAuditLog(
        user.id,
        'READ',
        'Auth',
        user.id,
        {
          event: 'LOGIN_FAILED',
          reason: 'Invalid password',
          attempts: newFailedAttempts,
        },
        requestId,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    // Success path
    const now = new Date();
    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.email,
      user.refreshTokenVersion,
    );

    const hashedRefreshToken = this.hashToken(refreshToken);

    await this.userRepository.updateAuthFields(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: now,
      hashedRefreshToken,
    });

    this.metrics.incrementLoginSuccess();
    this.createAuditLog(
      user.id,
      'READ',
      'Auth',
      user.id,
      { event: 'LOGIN_SUCCESS' },
      requestId,
    );

    return { accessToken, refreshToken };
  }

  async logout(userId: string, requestId: string): Promise<void> {
    const user = await this.userRepository.findRawById(userId);
    const newVersion = user ? user.refreshTokenVersion + 1 : 0;

    await this.userRepository.updateAuthFields(userId, {
      hashedRefreshToken: null,
      refreshTokenVersion: newVersion,
    });

    this.createAuditLog(
      userId,
      'UPDATE',
      'Auth',
      userId,
      { event: 'LOGOUT' },
      requestId,
    );
  }

  async refresh(
    token: string,
    requestId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findRawById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const hashedIncoming = this.hashToken(token);
      if (
        user.hashedRefreshToken !== hashedIncoming ||
        user.refreshTokenVersion !== payload.version
      ) {
        // Token reused or compromised -> Revoke all sessions for safety
        await this.userRepository.updateAuthFields(user.id, {
          hashedRefreshToken: null,
          refreshTokenVersion: user.refreshTokenVersion + 1,
        });
        this.createAuditLog(
          user.id,
          'UPDATE',
          'Auth',
          user.id,
          {
            event: 'REFRESH_REVOKED_REUSE',
            reason: 'Refresh token compromise suspected',
          },
          requestId,
        );
        throw new UnauthorizedException(
          'Session invalidated due to reuse detection',
        );
      }

      // Valid refresh path -> Rotate tokens
      const newVersion = user.refreshTokenVersion + 1;
      const accessToken = this.generateAccessToken(
        user.id,
        user.email,
        user.role,
      );
      const newRefreshToken = this.generateRefreshToken(
        user.id,
        user.email,
        newVersion,
      );
      const newHashedRefresh = this.hashToken(newRefreshToken);

      await this.userRepository.updateAuthFields(user.id, {
        refreshTokenVersion: newVersion,
        hashedRefreshToken: newHashedRefresh,
      });

      this.metrics.incrementTokenRefresh();
      this.createAuditLog(
        user.id,
        'UPDATE',
        'Auth',
        user.id,
        { event: 'TOKEN_REFRESH' },
        requestId,
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
  ): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: (this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES',
        ) || '15m') as any,
      },
    );
  }

  private generateRefreshToken(
    userId: string,
    email: string,
    version: number,
  ): string {
    return this.jwtService.sign(
      { sub: userId, email, version },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES',
        ) || '7d') as any,
      },
    );
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private createAuditLog(
    actorId: string | null,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
    entity: string,
    entityId: string | null,
    payload: any,
    requestId: string,
  ) {
    // Run asynchronously to be completely non-blocking
    void Promise.resolve().then(async () => {
      try {
        await this.prisma.auditLog.create({
          data: {
            actorId,
            action,
            entity,
            entityId,
            payload: { ...payload, requestId },
          },
        });
      } catch (err) {
        // Fallback log instead of failing request
        console.error(
          `⚠️ Non-blocking AuditLog creation failed [Request ID: ${requestId}]:`,
          err.message,
        );
      }
    });
  }
}
