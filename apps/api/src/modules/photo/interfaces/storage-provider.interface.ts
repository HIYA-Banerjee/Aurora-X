export interface StorageProvider {
  uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl(key: string): Promise<string>;
}
