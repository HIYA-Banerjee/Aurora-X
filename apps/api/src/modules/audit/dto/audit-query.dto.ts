import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';

export class AuditQueryDto {
  @ApiProperty({ required: false, description: 'Cursor ID for pagination' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({
    required: false,
    default: 20,
    description: 'Pagination limit (1 to 100)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({ required: false, description: 'Filter by actor ID' })
  @IsString()
  @IsOptional()
  actorId?: string;

  @ApiProperty({ required: false, description: 'Filter by entity type' })
  @IsString()
  @IsOptional()
  entity?: string;

  @ApiProperty({ required: false, description: 'Filter by entity ID' })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({
    enum: AuditAction,
    required: false,
    description: 'Filter by action type',
  })
  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @ApiProperty({ required: false, description: 'Filter by start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Filter by end date' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
