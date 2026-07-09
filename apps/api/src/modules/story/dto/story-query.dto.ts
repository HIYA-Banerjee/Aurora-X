import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StoryQueryDto {
  @ApiProperty({ required: false, description: 'Text search query' })
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

  @ApiProperty({ required: false, description: 'Filter by archived status' })
  @IsBooleanString()
  @IsOptional()
  archived?: string;

  @ApiProperty({ required: false, description: 'Filter by source memory UUID' })
  @IsString()
  @IsOptional()
  sourceMemoryId?: string;
}
