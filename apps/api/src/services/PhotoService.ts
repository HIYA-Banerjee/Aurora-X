import { Injectable } from '@nestjs/common';
import { PhotoRepository } from '../repositories/PhotoRepository';
import {
  CreatePhotoInput,
  UpdatePhotoInput,
  PhotoRecord,
} from '@aurora-x/shared-types';

@Injectable()
export class PhotoService {
  constructor(private readonly photoRepo: PhotoRepository) {}

  async create(data: CreatePhotoInput): Promise<PhotoRecord> {
    return this.photoRepo.create(data);
  }

  async findById(id: string): Promise<PhotoRecord | null> {
    return this.photoRepo.findById(id);
  }

  async findMany(filters?: any): Promise<PhotoRecord[]> {
    return this.photoRepo.findMany(filters);
  }

  async update(id: string, data: UpdatePhotoInput): Promise<PhotoRecord> {
    return this.photoRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.photoRepo.delete(id);
  }
}
