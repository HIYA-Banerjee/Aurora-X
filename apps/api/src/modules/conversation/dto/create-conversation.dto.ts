import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    example: 'user-uuid-9999',
    required: false,
    description: 'Optional participant ID',
  })
  @IsString()
  @IsOptional()
  participantId?: string;
}
