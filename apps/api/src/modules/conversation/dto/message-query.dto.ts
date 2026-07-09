import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageQueryDto {
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
}
