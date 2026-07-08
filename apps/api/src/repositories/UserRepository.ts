import { Injectable } from '@nestjs/common';
import {
  IUserRepository,
  UserRecord,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  Role,
} from '@aurora-x/shared-types';
import { PrismaService } from '../modules/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.mapToRecord(user);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) return null;
    return this.mapToRecord(user);
  }

  async findMany(filters?: UserFilters): Promise<UserRecord[]> {
    const users = await this.prisma.user.findMany({
      where: filters ? { email: filters.email } : undefined,
    });
    return users.map((user) => this.mapToRecord(user));
  }

  async create(data: CreateUserInput): Promise<UserRecord> {
    const user = await this.prisma.user.create({ data });
    return this.mapToRecord(user);
  }

  async update(id: string, data: UpdateUserInput): Promise<UserRecord> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.mapToRecord(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Auth-specific methods
  async findRawByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findRawById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateAuthFields(
    id: string,
    data: Partial<
      Pick<
        User,
        | 'passwordHash'
        | 'role'
        | 'refreshTokenVersion'
        | 'hashedRefreshToken'
        | 'failedLoginAttempts'
        | 'lockedUntil'
        | 'emailVerified'
        | 'emailVerifiedAt'
        | 'lastLogin'
      >
    >,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  private mapToRecord(user: User): UserRecord {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role as unknown as Role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
