import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

export class CreateMemoryDto {
  @ApiProperty({
    example: 'Summer Vacation in Paris',
    description: 'Title of the memory',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'A wonderful week in Paris visiting the Louvre...',
    required: false,
  })
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

  @ApiProperty({
    enum: Visibility,
    default: Visibility.PRIVATE,
    required: false,
  })
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
}
