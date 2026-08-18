import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMenuItemDto as ICreateMenuItemDto } from '@campus-food/shared-types';

export class CreateMenuItemDto implements ICreateMenuItemDto {
  @ApiPropertyOptional({ example: 'uuid-vendor-id' })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiProperty({ example: 'Tom Yum Noodle' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Spicy lemongrass broth with minced pork and soft boiled egg' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 55 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'Noodles' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDailySpecial?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
