import { Role } from '../role.enum';

/**
 * UserRepository – interface only, no implementation.
 */
export interface CreateUserInput {
  email: string;
  displayName?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  avatar?: string;
}

export interface UserFilters {
  email?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findMany(filters?: UserFilters): Promise<UserRecord[]>;
  create(data: CreateUserInput): Promise<UserRecord>;
  update(id: string, data: UpdateUserInput): Promise<UserRecord>;
  delete(id: string): Promise<void>;
}

export interface UserRecord {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

