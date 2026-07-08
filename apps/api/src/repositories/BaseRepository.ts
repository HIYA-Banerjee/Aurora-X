import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Generic BaseRepository providing CRUD operations, cursor pagination, and soft-delete support.
 * TModel: Prisma model type (e.g., Memory, Photo)
 * TCreate: DTO used for creation
 * TUpdate: DTO used for update
 */
@Injectable()
export abstract class BaseRepository<
  TModel,
  TCreate,
  TUpdate,
  TFindUniqueArgs = unknown,
  TFindManyArgs = unknown,
  TRecord = TModel,
> {
  protected constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: keyof PrismaClient,
  ) {}

  protected get model() {
    // Dynamic access to Prisma client model
    return (this.prisma as any)[this.modelName];
  }

  async create(
    data: TCreate,
    select?: Prisma.SelectSubset<TModel, any>,
  ): Promise<TRecord> {
    return await this.model.create({ data, ...(select ? { select } : {}) });
  }

  async findUnique(args: TFindUniqueArgs): Promise<TRecord | null> {
    return await this.model.findUnique(args);
  }

  async findMany(args: TFindManyArgs): Promise<TRecord[]> {
    return await this.model.findMany(args);
  }

  async findById(id: string): Promise<TRecord | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: TUpdate,
    select?: Prisma.SelectSubset<TModel, any>,
  ): Promise<TRecord> {
    return await this.model.update({
      where: { id },
      data,
      ...(select ? { select } : {}),
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  /** Soft delete  sets deletedAt timestamp; optionally sets archived flag */
  async softDelete(id: string, archive = false): Promise<TRecord> {
    const updateData: any = { deletedAt: new Date() };
    if (archive) updateData.archived = true;
    return await this.model.update({ where: { id }, data: updateData });
  }

  /** Restore a soft-deleted record */
  async restore(id: string): Promise<TRecord> {
    const updateData: any = { deletedAt: null };
    if (Object.keys(this.model?.fields ?? {}).includes('archived'))
      updateData.archived = false;
    return await this.model.update({ where: { id }, data: updateData });
  }

  /** Hard delete  admin only */
  async hardDelete(id: string): Promise<TRecord> {
    return await this.model.delete({ where: { id } });
  }
}
