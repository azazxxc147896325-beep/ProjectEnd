import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToggleMenuItemSpecialDto as IToggleMenuItemSpecialDto } from '@campus-food/shared-types';

export class ToggleMenuItemSpecialDto implements IToggleMenuItemSpecialDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isDailySpecial: boolean;
}
