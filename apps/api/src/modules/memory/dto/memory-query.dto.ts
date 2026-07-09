import {
  IsString,
  IsOptional,
  IsEnum,
  IsBooleanString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

export class MemoryQueryDto {
  @ApiProperty({
    required: false,
    description: 'Filter by text search on title/description',
  })
  @IsString()
  @IsOptional()
  search?: string;

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

  @ApiProperty({ required: false, description: 'Filter by favorite status' })
  @IsBooleanString()
  @IsOptional()
  favorite?: string;

  @ApiProperty({ required: false, description: 'Filter by archived status' })
  @IsBooleanString()
  @IsOptional()
  archived?: string;

  @ApiProperty({ required: false, description: 'Filter by visibility' })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @ApiProperty({ required: false, description: 'Filter by emotion category' })
  @IsString()
  @IsOptional()
  emotion?: string;

  @ApiProperty({ required: false, description: 'Filter by importance score' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  importance?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by tag (comma-separated or single)',
  })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by starting event date',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Filter by ending event date' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Filter by location name' })
  @IsString()
  @IsOptional()
  location?: string;
}
