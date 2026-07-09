import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoryDto {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    required: false,
    description: 'Optional UUID of the linked memory',
  })
  @IsUUID()
  @IsOptional()
  sourceMemoryId?: string;

  @ApiProperty({
    example: 'Once upon a time in Paris, we walked under the Eiffel Tower...',
    description: 'Generated story content',
  })
  @IsString()
  @IsNotEmpty()
  generatedContent: string;

  @ApiProperty({
    example: 'gpt-4o',
    description: 'The AI model name used to generate this story',
  })
  @IsString()
  @IsNotEmpty()
  generationModel: string;

  @ApiProperty({
    example: 'v1.2',
    required: false,
    description: 'Version of the prompt',
  })
  @IsString()
  @IsOptional()
  promptVersion?: string;
}
