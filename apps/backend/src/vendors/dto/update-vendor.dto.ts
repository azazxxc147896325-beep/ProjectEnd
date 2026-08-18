import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateVendorDto as IUpdateVendorDto } from '@campus-food/shared-types';

export class UpdateVendorDto implements IUpdateVendorDto {
  @ApiPropertyOptional({ example: 'Grandma Noodles Premium' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Best noodles on campus!' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
