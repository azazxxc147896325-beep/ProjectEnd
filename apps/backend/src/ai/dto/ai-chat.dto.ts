import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiChatMessage, AiChatRequest } from '@campus-food/shared-types';

export class AiChatDto implements AiChatRequest {
  @ApiProperty({ example: 'uuid-vendor-id' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ example: 'วันนี้เมนูไหนขายดีที่สุด และยอดขายรวมเป็นเท่าไหร่?' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ type: Array, description: 'Prior message conversation history' })
  @IsOptional()
  @IsArray()
  history?: AiChatMessage[];
}
