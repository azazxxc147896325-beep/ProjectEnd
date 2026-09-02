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
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { WsEvents, Role, JwtPayload } from '@campus-food/shared-types';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const configuredOrigins = (process.env.FRONTEND_URL || '')
        .split(',')
        .map((o) => o.trim().replace(/\/$/, ''))
        .filter(Boolean);

      const allowed = Array.from(
        new Set([
          'http://localhost:3000',
          'http://localhost:19006',
          ...configuredOrigins,
        ]),
      );

      const isProd = process.env.NODE_ENV === 'production';
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';

      if (!origin || allowed.includes(normalizedOrigin) || !isProd) {
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

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Socket.io WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization?.startsWith('Bearer ')
          ? client.handshake.headers.authorization.slice(7)
          : client.handshake.headers?.authorization);

      if (rawToken && typeof rawToken === 'string' && rawToken.trim() !== '') {
        const decoded = this.jwtService.verify<JwtPayload>(rawToken.trim());
        client.data.user = decoded;
        this.logger.log(`Client authenticated: ${client.id} (User: ${decoded.email}, Role: ${decoded.role})`);
      } else {
        this.logger.log(`Client connected (anonymous): ${client.id}`);
      }
    } catch (err) {
      this.logger.warn(`Client connection with invalid token: ${client.id}`);
      client.data.user = null;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WsEvents.JOIN_VENDOR_ROOM)
  async handleJoinVendorRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vendorId: string },
  ) {
    if (!data?.vendorId) {
      return { event: 'error', message: 'vendorId is required' };
    }

    const user: JwtPayload | undefined = client.data?.user;

    // Must be authenticated to join private vendor room
    if (!user) {
      this.logger.warn(`Unauthorized JOIN_VENDOR_ROOM attempt from unauthenticated client ${client.id} for vendor ${data.vendorId}`);
      client.emit('error', { message: 'Authentication required to join vendor room' });
      return { event: 'error', message: 'Authentication required' };
    }

    // Admins can join any vendor room
    let isAuthorized = user.role === Role.ADMIN;

    if (!isAuthorized) {
      if (user.vendorId === data.vendorId) {
        isAuthorized = true;
      } else {
        // Double-check DB ownership in case vendorId wasn't in token payload
        const vendor = await this.prisma.vendor.findUnique({
          where: { id: data.vendorId },
          select: { ownerId: true },
        });
        if (vendor && vendor.ownerId === user.sub) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      this.logger.warn(`Forbidden JOIN_VENDOR_ROOM attempt by user ${user.email} (${user.sub}) for vendor ${data.vendorId}`);
      client.emit('error', { message: 'Forbidden: You do not own this vendor store' });
      return { event: 'error', message: 'Forbidden' };
    }

    const room = `vendor_${data.vendorId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} (Vendor Owner: ${user.email}) joined room ${room}`);
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
  async handleJoinOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data?.orderId) {
      return { event: 'error', message: 'orderId is required' };
    }

    const user: JwtPayload | undefined = client.data?.user;

    if (!user) {
      this.logger.warn(`Unauthorized JOIN_ORDER_ROOM attempt from unauthenticated client ${client.id} for order ${data.orderId}`);
      client.emit('error', { message: 'Authentication required to track order' });
      return { event: 'error', message: 'Authentication required' };
    }

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      select: { studentId: true, vendorId: true },
    });

    if (!order) {
      client.emit('error', { message: 'Order not found' });
      return { event: 'error', message: 'Order not found' };
    }

    // Authorized if student who placed order, vendor owner, or admin
    const isAuthorized =
      user.role === Role.ADMIN ||
      user.sub === order.studentId ||
      user.vendorId === order.vendorId;

    if (!isAuthorized) {
      this.logger.warn(`Forbidden JOIN_ORDER_ROOM attempt by user ${user.email} (${user.sub}) for order ${data.orderId}`);
      client.emit('error', { message: 'Forbidden: You are not authorized to view this order' });
      return { event: 'error', message: 'Forbidden' };
    }

    const room = `order_${data.orderId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} (User: ${user.email}) joined room ${room}`);
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

  @SubscribeMessage(WsEvents.SHOW_PAYMENT_QR)
  async handleShowPaymentQr(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user: JwtPayload | undefined = client.data?.user;
    if (!user || (!data.vendorId && !user.vendorId)) {
      return { event: 'error', message: 'Unauthorized' };
    }

    const vendorId = data.vendorId || user.vendorId;
    if (user.role !== Role.ADMIN && user.vendorId !== vendorId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId }, select: { ownerId: true } });
      if (!vendor || vendor.ownerId !== user.sub) {
        return { event: 'error', message: 'Forbidden' };
      }
    }

    const room = `vendor_${vendorId}`;
    this.logger.log(`Broadcasting SHOW_PAYMENT_QR to ${room} for order ${data.orderId || data.queueNumber}`);
    this.server.to(room).emit(WsEvents.SHOW_PAYMENT_QR, data);
    return { event: 'broadcasted', room };
  }

  @SubscribeMessage(WsEvents.CLEAR_PAYMENT_QR)
  async handleClearPaymentQr(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vendorId: string; orderId?: string },
  ) {
    const user: JwtPayload | undefined = client.data?.user;
    if (!user || (!data.vendorId && !user.vendorId)) {
      return { event: 'error', message: 'Unauthorized' };
    }

    const vendorId = data.vendorId || user.vendorId;
    if (user.role !== Role.ADMIN && user.vendorId !== vendorId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId }, select: { ownerId: true } });
      if (!vendor || vendor.ownerId !== user.sub) {
        return { event: 'error', message: 'Forbidden' };
      }
    }

    const room = `vendor_${vendorId}`;
    this.logger.log(`Broadcasting CLEAR_PAYMENT_QR to ${room}`);
    this.server.to(room).emit(WsEvents.CLEAR_PAYMENT_QR, data);
    return { event: 'broadcasted', room };
  }

  @SubscribeMessage(WsEvents.PRINT_QUEUE_TICKET)
  async handlePrintQueueTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vendorId: string; order: any },
  ) {
    const user: JwtPayload | undefined = client.data?.user;
    if (!user || (!data.vendorId && !user.vendorId)) {
      return { event: 'error', message: 'Unauthorized' };
    }

    const vendorId = data.vendorId || user.vendorId;
    if (user.role !== Role.ADMIN && user.vendorId !== vendorId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId }, select: { ownerId: true } });
      if (!vendor || vendor.ownerId !== user.sub) {
        return { event: 'error', message: 'Forbidden' };
      }
    }

    const room = `vendor_${vendorId}`;
    this.logger.log(`Broadcasting PRINT_QUEUE_TICKET to ${room} for queue #${data.order?.queueNumber}`);
    this.server.to(room).emit(WsEvents.PRINT_QUEUE_TICKET, data);
    return { event: 'broadcasted', room };
  }
}
