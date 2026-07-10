import { Test, TestingModule } from '@nestjs/testing';
import { PhotoService } from '../photo.service';
import { PhotoRepository } from '../../../repositories/PhotoRepository';
import { OwnershipService } from '../../../common/services/ownership.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// --- Mocks ---

const mockPhotoRepo = {
  softDelete: jest.fn(),
  restore: jest.fn(),
};

const mockOwnershipService = {
  checkOwnership: jest.fn(),
};

const mockStorageProvider = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getSignedUrl: jest.fn(),
};

const mockPrisma = {
  photo: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

// Mock sharp at module level — the factory returns fresh resolved buffers each time
jest.mock('sharp', () => {
  const instance = () => ({
    resize: () => instance(),
    jpeg: () => instance(),
    webp: () => instance(),
    toBuffer: () => Promise.resolve(Buffer.from('processed-image')),
    metadata: () => Promise.resolve({ width: 1920, height: 1080 }),
  });
  return instance;
});

describe('PhotoService', () => {
  let service: PhotoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoService,
        { provide: PhotoRepository, useValue: mockPhotoRepo },
        { provide: OwnershipService, useValue: mockOwnershipService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'StorageProvider', useValue: mockStorageProvider },
      ],
    }).compile();

    service = module.get<PhotoService>(PhotoService);
    jest.clearAllMocks();
  });

  describe('uploadPhoto — validation', () => {
    it('should throw BadRequestException when no file is provided', async () => {
      await expect(
        service.uploadPhoto('user-1', undefined as any, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file exceeds 5MB', async () => {
      const bigFile = {
        buffer: Buffer.alloc(100),
        mimetype: 'image/jpeg',
        originalname: 'photo.jpg',
        size: 6 * 1024 * 1024, // 6 MB — over limit
      } as Express.Multer.File;

      await expect(
        service.uploadPhoto('user-1', bigFile, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-image MIME types', async () => {
      const pdfFile = {
        buffer: Buffer.from('fake pdf'),
        mimetype: 'application/pdf',
        originalname: 'doc.pdf',
        size: 1024,
      } as Express.Multer.File;

      await expect(
        service.uploadPhoto('user-1', pdfFile, undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadPhoto — atomic rollback on DB failure', () => {
    it('should delete storage files when database creation fails', async () => {
      const validFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        originalname: 'photo.jpg',
        size: 1024,
      } as Express.Multer.File;

      // Storage upload succeeds for both calls
      mockStorageProvider.uploadFile.mockResolvedValue('photos/uuid.jpg');
      mockStorageProvider.deleteFile.mockResolvedValue(undefined);
      // DB create fails after both storage uploads have succeeded
      mockPrisma.photo.create.mockRejectedValue(
        new Error('DB connection lost'),
      );

      await expect(
        service.uploadPhoto('user-1', validFile, undefined),
      ).rejects.toThrow();

      // Service calls deleteFile for both originalKey and thumbnailKey on rollback
      expect(mockStorageProvider.deleteFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when photo does not exist', async () => {
      mockPrisma.photo.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne('user-1', 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return photo when found and ownership passes', async () => {
      const photo = { id: 'photo-1', ownerId: 'user-1', deletedAt: null };
      mockPrisma.photo.findUnique.mockResolvedValue(photo);
      mockOwnershipService.checkOwnership.mockReturnValue(undefined);
      const result = await service.findOne('user-1', 'photo-1');
      expect(result).toEqual(photo);
    });
  });
});
