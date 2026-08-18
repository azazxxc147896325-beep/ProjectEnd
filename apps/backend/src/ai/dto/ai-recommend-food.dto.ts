import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiChatMessage, AiFoodRecommendationRequest } from '@campus-food/shared-types';

export class AiRecommendFoodDto implements AiFoodRecommendationRequest {
  @ApiProperty({ example: 'อยากกินอะไรแซ่บๆ งบไม่เกิน 60 บาท' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ example: 'อาหารจานเดียว' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'หิวมาก' })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiPropertyOptional({ type: Array, description: 'Previous chat history' })
  @IsOptional()
  @IsArray()
  history?: AiChatMessage[];
}
