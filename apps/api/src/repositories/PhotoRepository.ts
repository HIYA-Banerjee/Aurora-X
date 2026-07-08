import { Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Photo as PrismaPhoto, Prisma } from '@prisma/client';
import { CreatePhotoInput, UpdatePhotoInput } from '@aurora-x/shared-types';

@Injectable()
export class PhotoRepository extends BaseRepository<
  PrismaPhoto,
  CreatePhotoInput,
  UpdatePhotoInput,
  Prisma.PhotoFindUniqueArgs,
  Prisma.PhotoFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'photo');
  }

  // Additional photo‑specific queries can be added here
}
