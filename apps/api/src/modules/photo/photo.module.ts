import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from './storage.module';

@Module({
  imports: [AuthModule, PrismaModule, StorageModule],
  controllers: [PhotoController],
  providers: [PhotoService, PhotoRepository],
  exports: [PhotoService, PhotoRepository],
})
export class PhotoModule {}
