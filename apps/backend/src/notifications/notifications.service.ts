import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { WsEvents, OrderStatus, Order } from '@campus-food/shared-types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private gateway: NotificationsGateway) {}

  notifyNewOrder(vendorId: string, order: Order) {
    const room = `vendor_${vendorId}`;
    this.logger.log(`Emitting NEW_ORDER to room ${room} for order ${order.id}`);
    this.gateway.server.to(room).emit(WsEvents.NEW_ORDER, {
      vendorId,
      order,
    });
  }

  notifyOrderStatusChanged(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
  ) {
    const orderRoom = `order_${order.id}`;
    const vendorRoom = `vendor_${order.vendorId}`;
    const payload = {
      orderId: order.id,
      vendorId: order.vendorId,
      studentId: order.studentId,
      previousStatus,
      newStatus,
      queueNumber: order.queueNumber,
      readyAt: order.readyAt,
      completedAt: order.completedAt,
      order,
    };

    this.logger.log(`Emitting ORDER_STATUS_UPDATED to rooms: ${orderRoom}, ${vendorRoom}`);
    this.gateway.server.to(orderRoom).emit(WsEvents.ORDER_STATUS_UPDATED, payload);
    this.gateway.server.to(vendorRoom).emit(WsEvents.ORDER_STATUS_UPDATED, payload);

    if (newStatus === OrderStatus.READY) {
      this.logger.log(`Triggering instant notification: ORDER_READY for order ${order.id} (Queue #${order.queueNumber})`);
      this.gateway.server.to(orderRoom).emit(WsEvents.ORDER_READY, payload);
    }
  }
}

