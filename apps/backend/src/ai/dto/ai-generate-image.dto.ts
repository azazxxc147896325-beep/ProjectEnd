import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiFoodImageStyle, AiGenerateImageRequest } from '@campus-food/shared-types';

export class AiGenerateImageDto implements AiGenerateImageRequest {
  @ApiProperty({ example: 'ข้าวกะเพราหมูกรอบไข่ดาว' })
  @IsString()
  @IsNotEmpty()
  dishName: string;

  @ApiPropertyOptional({ example: 'อาหารจานเดียว' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: ['realistic_studio', 'street_food', 'minimal_cafe', 'overhead_flatlay', 'cinematic_moody'],
    example: 'realistic_studio',
  })
  @IsOptional()
  @IsString()
  style?: AiFoodImageStyle;

  @ApiPropertyOptional({ example: 'หมูกรอบชิ้นหนาฉ่ำ ไข่ดาวกรอบไข่แดงเยิ้ม พร้อมใบกะเพราสด' })
  @IsOptional()
  @IsString()
  customPrompt?: string;
}
