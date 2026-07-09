import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly config: ConfigService) {
    this.bucketName =
      this.config.get<string>('AWS_S3_BUCKET') || 'aurora-x-assets';
    this.s3Client = new S3Client({
      region: this.config.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });
    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client as any, command as any, {
      expiresIn: 3600,
    });
  }
}
