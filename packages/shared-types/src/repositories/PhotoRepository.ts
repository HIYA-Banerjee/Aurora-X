/**
 * PhotoRepository – interface only, no implementation.
 */
export interface CreatePhotoInput {
  ownerId: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSize?: number;
  storageKey?: string;
  memoryId?: string;
}

export interface UpdatePhotoInput {
  width?: number;
  height?: number;
  mimeType?: string;
  fileSize?: number;
  storageKey?: string;
  memoryId?: string | null;
}

export interface PhotoFilters {
  ownerId?: string;
  memoryId?: string;
  mimeType?: string;
}

export interface PhotoRecord {
  id: string;
  ownerId: string;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  fileSize: number | null;
  storageKey: string | null;
  memoryId: string | null;
  archived?: boolean;
  deletedAt?: Date | null;
  uploadedAt: Date;
}

export interface IPhotoRepository {
  findById(id: string): Promise<PhotoRecord | null>;
  findMany(filters?: PhotoFilters): Promise<PhotoRecord[]>;
  create(data: CreatePhotoInput): Promise<PhotoRecord>;
  update(id: string, data: UpdatePhotoInput): Promise<PhotoRecord>;
  delete(id: string): Promise<void>;
}
