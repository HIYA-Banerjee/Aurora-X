import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoryDto {
  @ApiProperty({ example: 'Updated story text...', required: false })
  @IsString()
  @IsOptional()
  generatedContent?: string;

  @ApiProperty({ example: 'gpt-4o', required: false })
  @IsString()
  @IsOptional()
  generationModel?: string;

  @ApiProperty({ example: 'v1.3', required: false })
  @IsString()
  @IsOptional()
  promptVersion?: string;

  @ApiProperty({
    example: '2026-07-08T12:00:00.000Z',
    required: false,
    description: 'Optimistic concurrency timestamp',
  })
  @IsDateString()
  @IsOptional()
  updatedAt?: string;
}
