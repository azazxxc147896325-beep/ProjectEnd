import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CancelOrderDto as ICancelOrderDto } from '@campus-food/shared-types';

export class CancelOrderDto implements ICancelOrderDto {
  @ApiPropertyOptional({ example: 'เปลี่ยนใจ / สั่งผิดรายการ' })
  @IsOptional()
  @IsString()
  reason?: string;
}
