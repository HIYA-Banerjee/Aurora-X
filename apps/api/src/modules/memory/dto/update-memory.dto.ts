import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

export class UpdateMemoryDto {
  @ApiProperty({
    example: 'Summer Vacation in Paris (Updated)',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'A wonderful week in Paris...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-07-08T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @ApiProperty({ example: 'Paris, France', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ enum: Visibility, required: false })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @ApiProperty({
    example: { favorite: true, emotion: 'happy', importance: 5 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: ['travel', 'vacation'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: '2026-07-08T12:00:00.000Z',
    description:
      'Timestamp of the last known update for optimistic concurrency checks',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  updatedAt?: string;
}
