import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsEvents } from '@campus-food/shared-types';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:19006',
      ];
      if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`WebSocket origin ${origin} not allowed`));
      }
    },
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  afterInit(server: Server) {
    this.logger.log('Socket.io WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WsEvents.JOIN_VENDOR_ROOM)
  handleJoinVendorRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vendorId: string },
  ) {
    const room = `vendor_${data.vendorId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage(WsEvents.LEAVE_VENDOR_ROOM)
  handleLeaveVendorRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vendorId: string },
  ) {
    const room = `vendor_${data.vendorId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage(WsEvents.JOIN_ORDER_ROOM)
  handleJoinOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const room = `order_${data.orderId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage(WsEvents.LEAVE_ORDER_ROOM)
  handleLeaveOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const room = `order_${data.orderId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }
}
