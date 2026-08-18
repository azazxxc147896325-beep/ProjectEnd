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
