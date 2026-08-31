import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, PaymentMethod, CreateOrderDto as ICreateOrderDto, CreateOrderItemDto as ICreateOrderItemDto } from '@campus-food/shared-types';

export class CreateOrderItemDto implements ICreateOrderItemDto {
  @ApiProperty({ example: 'uuid-menu-item-id' })
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({ example: 2, default: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: { spicyLevel: 'medium', extraNoodles: false } })
  @IsOptional()
  options?: Record<string, any>;
}

export class CreateOrderDto implements ICreateOrderDto {
  @ApiProperty({ example: 'uuid-vendor-id' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ enum: OrderType, default: OrderType.DINE_IN })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'No coriander please' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

