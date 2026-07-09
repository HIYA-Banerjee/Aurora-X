import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageProvider,
    S3StorageProvider,
    {
      provide: 'StorageProvider',
      useClass:
        process.env.NODE_ENV === 'production'
          ? S3StorageProvider
          : LocalStorageProvider,
    },
  ],
  exports: ['StorageProvider'],
})
export class StorageModule {}
