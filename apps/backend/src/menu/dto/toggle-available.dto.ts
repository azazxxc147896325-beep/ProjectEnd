import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToggleMenuItemAvailableDto as IToggleMenuItemAvailableDto } from '@campus-food/shared-types';

export class ToggleMenuItemAvailableDto implements IToggleMenuItemAvailableDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;
}
