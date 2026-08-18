import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, UpdateOrderStatusDto as IUpdateOrderStatusDto } from '@campus-food/shared-types';

export class UpdateOrderStatusDto implements IUpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.COOKING })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'วัตถุดิบหมด' })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

