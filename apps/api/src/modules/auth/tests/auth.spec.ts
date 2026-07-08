import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthMetricsService } from '../services/auth-metrics.service';
import { UserRepository } from '../../../repositories/UserRepository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

describe('AuthService Integration Tests', () => {
  let authService: AuthService;
  let metricsService: AuthMetricsService;
  let jwtService: JwtService;

  const mockPrismaUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    displayName: 'Test User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed-password-123',
    role: Role.USER,
    refreshTokenVersion: 0,
    hashedRefreshToken: 'some-hashed-token',
    failedLoginAttempts: 0,
    lockedUntil: null,
    emailVerified: false,
    emailVerifiedAt: null,
    lastLogin: null,
  };

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest
        .fn()
        .mockImplementation(() => Promise.resolve({ id: 'audit-log-id' })),
    },
  };

  const configServiceMock = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'JWT_ACCESS_SECRET':
          return 'test-access-secret-key-32-chars-long';
        case 'JWT_REFRESH_SECRET':
          return 'test-refresh-secret-key-32-chars-long';
        case 'JWT_ACCESS_TOKEN_EXPIRES':
          return '15m';
        case 'JWT_REFRESH_TOKEN_EXPIRES':
          return '7d';
        case 'MAX_LOGIN_ATTEMPTS':
          return 5;
        case 'ACCOUNT_LOCK_MINUTES':
          return 15;
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthMetricsService,
        UserRepository,
        JwtService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    metricsService = module.get<AuthMetricsService>(AuthMetricsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);
      prismaServiceMock.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        displayName: 'New User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prismaServiceMock.user.update.mockResolvedValue({
        ...mockPrismaUser,
        id: 'new-user-id',
        email: 'new@example.com',
      });

      const registerDto = {
        email: 'new@example.com',
        password: 'Password123!',
        displayName: 'New User',
      };

      const result = await authService.register(registerDto, 'req-id-1');

      expect(result).toBeDefined();
      expect(result.email).toBe('new@example.com');
      expect(prismaServiceMock.user.create).toHaveBeenCalled();
      expect(prismaServiceMock.user.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(mockPrismaUser);

      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'New User',
      };

      await expect(
        authService.register(registerDto, 'req-id-2'),
      ).rejects.toThrow(ConflictException);
      expect(prismaServiceMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const password = 'Password123!';
      const hash = await argon2.hash(password);
      const userWithHash = { ...mockPrismaUser, passwordHash: hash };

      prismaServiceMock.user.findUnique.mockResolvedValue(userWithHash);
      prismaServiceMock.user.update.mockResolvedValue(userWithHash);

      const loginDto = {
        email: 'test@example.com',
        password,
      };

      const result = await authService.login(loginDto, 'req-id-3');

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(metricsService.getMetrics().successfulLogins).toBe(1);
    });

    it('should increment login failure and throw UnauthorizedException for invalid password', async () => {
      const hash = await argon2.hash('Password123!');
      const userWithHash = {
        ...mockPrismaUser,
        passwordHash: hash,
        failedLoginAttempts: 0,
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(userWithHash);
      prismaServiceMock.user.update.mockResolvedValue({
        ...userWithHash,
        failedLoginAttempts: 1,
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto, 'req-id-4')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(metricsService.getMetrics().failedLogins).toBe(1);
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedLoginAttempts: 1 }),
        }),
      );
    });

    it('should lockout account after max failed attempts', async () => {
      const hash = await argon2.hash('Password123!');
      const userWithHash = {
        ...mockPrismaUser,
        passwordHash: hash,
        failedLoginAttempts: 4,
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(userWithHash);
      prismaServiceMock.user.update.mockResolvedValue({
        ...userWithHash,
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 15 * 60000),
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto, 'req-id-5')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(metricsService.getMetrics().accountLockouts).toBe(1);
    });

    it('should throw ForbiddenException if account is currently locked', async () => {
      const lockedUser = {
        ...mockPrismaUser,
        lockedUntil: new Date(Date.now() + 10 * 60000),
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(lockedUser);

      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(authService.login(loginDto, 'req-id-6')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('refresh', () => {
    it('should rotate tokens and return new pairs for valid refresh token', async () => {
      const refreshToken = jwtService.sign(
        {
          sub: mockPrismaUser.id,
          email: mockPrismaUser.email,
          version: mockPrismaUser.refreshTokenVersion,
        },
        { secret: 'test-refresh-secret-key-32-chars-long', expiresIn: '7d' },
      );

      const hasher = require('crypto').createHash('sha256');
      const hashedRefresh = hasher.update(refreshToken).digest('hex');

      const userWithHash = {
        ...mockPrismaUser,
        hashedRefreshToken: hashedRefresh,
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(userWithHash);
      prismaServiceMock.user.update.mockResolvedValue(userWithHash);

      const result = await authService.refresh(refreshToken, 'req-id-7');

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(metricsService.getMetrics().tokenRefreshes).toBe(1);
    });

    it('should revoke all tokens and throw UnauthorizedException if reuse is detected', async () => {
      const refreshToken = jwtService.sign(
        {
          sub: mockPrismaUser.id,
          email: mockPrismaUser.email,
          version: mockPrismaUser.refreshTokenVersion,
        },
        { secret: 'test-refresh-secret-key-32-chars-long', expiresIn: '7d' },
      );

      const userWithHash = {
        ...mockPrismaUser,
        hashedRefreshToken: 'some-other-hash', // mismatch
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(userWithHash);

      await expect(
        authService.refresh(refreshToken, 'req-id-8'),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ hashedRefreshToken: null }),
        }),
      );
    });
  });

  describe('logout', () => {
    it('should invalidate the refresh token version and hash in database', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(mockPrismaUser);
      prismaServiceMock.user.update.mockResolvedValue({
        ...mockPrismaUser,
        hashedRefreshToken: null,
        refreshTokenVersion: 1,
      });

      await authService.logout(mockPrismaUser.id, 'req-id-9');

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockPrismaUser.id },
          data: expect.objectContaining({
            hashedRefreshToken: null,
            refreshTokenVersion: mockPrismaUser.refreshTokenVersion + 1,
          }),
        }),
      );
    });
  });
});
