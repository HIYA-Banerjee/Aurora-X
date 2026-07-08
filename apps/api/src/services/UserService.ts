import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/UserRepository';
import {
  CreateUserInput,
  UpdateUserInput,
  UserRecord,
} from '@aurora-x/shared-types';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async create(data: CreateUserInput): Promise<UserRecord> {
    return this.userRepo.create(data);
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.userRepo.findById(id);
  }

  async findMany(): Promise<UserRecord[]> {
    return this.userRepo.findMany();
  }

  async update(id: string, data: UpdateUserInput): Promise<UserRecord> {
    return this.userRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
