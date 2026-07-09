import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir = path.join(
    process.cwd(),
    'apps',
    'api',
    'uploads',
  );

  constructor() {
    // Ensure upload directory exists
    fs.mkdir(this.uploadDir, { recursive: true }).catch((err) => {
      console.error('Failed to create local upload directory:', err.message);
    });
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    _mimeType: string,
  ): Promise<string> {
    const filePath = path.join(this.uploadDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return `/uploads/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}/uploads/${key}`;
  }
}
