import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToggleVendorOpenDto as IToggleVendorOpenDto } from '@campus-food/shared-types';

export class ToggleVendorOpenDto implements IToggleVendorOpenDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isOpen: boolean;
}
