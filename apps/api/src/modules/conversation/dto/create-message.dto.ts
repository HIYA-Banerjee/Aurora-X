import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class CreateMessageDto {
  @ApiProperty({
    enum: MessageRole,
    example: MessageRole.USER,
    description: 'Role of the message sender',
  })
  @IsEnum(MessageRole)
  role: MessageRole;

  @ApiProperty({
    example: 'Hello! Can you summarize my memories from yesterday?',
    description: 'Content of the message',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 45,
    required: false,
    description: 'Token usage of the message',
  })
  @IsInt()
  @IsOptional()
  tokenUsage?: number;

  @ApiProperty({
    example: 'gpt-4o',
    required: false,
    description: 'The model name used',
  })
  @IsString()
  @IsOptional()
  model?: string;
}
