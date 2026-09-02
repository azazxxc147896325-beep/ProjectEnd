import { OrderStatus } from './enums';
import type { Order } from './models';

export enum WsEvents {
  JOIN_VENDOR_ROOM = 'join_vendor_room',
  LEAVE_VENDOR_ROOM = 'leave_vendor_room',
  JOIN_ORDER_ROOM = 'join_order_room',
  LEAVE_ORDER_ROOM = 'leave_order_room',
  NEW_ORDER = 'new_order',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  ORDER_READY = 'order_ready',
  SHOW_PAYMENT_QR = 'show_payment_qr',
  CLEAR_PAYMENT_QR = 'clear_payment_qr',
  PRINT_QUEUE_TICKET = 'print_queue_ticket',
  PAYMENT_SUCCESS = 'payment_success',
}

export interface JoinVendorRoomDto {
  vendorId: string;
}

export interface JoinOrderRoomDto {
  orderId: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  vendorId: string;
  studentId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  queueNumber: number;
  readyAt?: string | null;
  completedAt?: string | null;
  order: Order;
}

export interface NewOrderPayload {
  vendorId: string;
  order: Order;
}

export interface ShowPaymentQrPayload {
  vendorId: string;
  orderId: string;
  queueNumber: number;
  totalPrice: number;
  promptpayQrPayload: string;
  orderType: string;
  itemsSummary: string[];
  order?: Order;
}

export interface ClearPaymentQrPayload {
  vendorId: string;
  orderId?: string;
}

export interface PrintQueueTicketPayload {
  vendorId: string;
  order: Order;
}

