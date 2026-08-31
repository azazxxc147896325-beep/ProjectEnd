import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from './enums';
export type { Order, OrderItem, OrderItemOption } from './models';

export interface CreateOrderItemDto {
  menuItemId: string;
  quantity: number;
  options?: import('./models').OrderItemOption[] | Record<string, any>;
}

export interface CreateOrderDto {
  vendorId: string;
  orderType: OrderType;
  paymentMethod?: PaymentMethod;
  note?: string;
  items: CreateOrderItemDto[];
}

export interface VerifyPaymentDto {
  transactionId?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  cancelReason?: string;
}

export interface CancelOrderDto {
  reason?: string;
}

export interface OrderFilterQuery {

  status?: OrderStatus;
  orderType?: OrderType;
  date?: string;
}
