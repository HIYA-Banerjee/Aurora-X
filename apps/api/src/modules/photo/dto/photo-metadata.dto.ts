import { IsOptional, IsString, IsInt, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhotoMetadataDto {
  @ApiProperty({ example: 800, required: false })
  @IsInt()
  @IsOptional()
  width?: number;

  @ApiProperty({ example: 600, required: false })
  @IsInt()
  @IsOptional()
  height?: number;

  @ApiProperty({ example: 'image/png', required: false })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({ example: 102400, required: false })
  @IsInt()
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  memoryId?: string;
}
