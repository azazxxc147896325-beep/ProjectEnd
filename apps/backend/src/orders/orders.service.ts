import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Role, CancelledBy, Order, PaymentMethod, PaymentStatus } from '@campus-food/shared-types';
import { generatePromptPayPayload } from './promptpay.util';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Calculate next queue number for a given vendor for today (within a transaction).
   * Must be called inside a Prisma transaction to prevent Race Conditions.
   */
  private async calculateQueueNumberInTx(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    vendorId: string,
    targetDate: Date = new Date(),
  ): Promise<number> {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const latestOrder = await tx.order.findFirst({
      where: {
        vendorId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { queueNumber: 'desc' },
      select: { queueNumber: true },
    });

    return latestOrder ? latestOrder.queueNumber + 1 : 1;
  }

  /**
   * Compute total price and validated order items from database prices.
   */
  calculateTotalPrice(
    items: { quantity: number; unitPrice: number; options?: Record<string, unknown> }[],
  ): { totalPrice: number; validatedItems: { quantity: number; unitPrice: number; subtotal: number; options?: Record<string, unknown> }[] } {
    let totalPrice = 0;
    const validatedItems = items.map((item) => {
      const unitPrice = Number(item.unitPrice);
      const subtotal = Number((unitPrice * item.quantity).toFixed(2));
      totalPrice += subtotal;
      return { ...item, unitPrice, subtotal };
    });
    return { totalPrice: Number(totalPrice.toFixed(2)), validatedItems };
  }

  async createOrder(studentId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Fetch vendor and menu items in parallel to reduce database roundtrips
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const [vendor, menuItems] = await Promise.all([
      this.prisma.vendor.findUnique({ where: { id: dto.vendorId } }),
      this.prisma.menuItem.findMany({
        where: { id: { in: menuItemIds }, vendorId: dto.vendorId, deletedAt: null },
      }),
    ]);

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${dto.vendorId} not found`);
    }

    if (!vendor.isOpen) {
      throw new BadRequestException('This vendor is currently closed and not accepting orders');
    }

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items are invalid or do not belong to this vendor');
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // Check item availability
    for (const itemDto of dto.items) {
      const menuItem = menuMap.get(itemDto.menuItemId);
      if (!menuItem.isAvailable) {
        throw new BadRequestException(`"${menuItem.name}" is currently unavailable`);
      }
    }

    const itemCalculations = dto.items.map((itemDto) => {
      const menuItem = menuMap.get(itemDto.menuItemId);
      const unitPrice = Number(menuItem.price);
      const subtotal = Number((unitPrice * itemDto.quantity).toFixed(2));
      return { menuItemId: menuItem.id, quantity: itemDto.quantity, unitPrice, subtotal, options: itemDto.options || null };
    });

    const totalPrice = itemCalculations.reduce((sum, item) => sum + item.subtotal, 0);

    const paymentMethod = dto.paymentMethod || PaymentMethod.CASH;
    let promptpayQrPayload: string | null = null;
    if (paymentMethod === PaymentMethod.PROMPTPAY) {
      promptpayQrPayload = generatePromptPayPayload('0812345678', totalPrice);
    }

    // 🔒 Use a Transaction to atomically assign queue number + create order
    // This prevents Race Conditions when multiple students order simultaneously
    const order = await this.prisma.$transaction(async (tx) => {
      const queueNumber = await this.calculateQueueNumberInTx(tx, dto.vendorId);

      return tx.order.create({
        data: {
          studentId,
          vendorId: dto.vendorId,
          orderType: dto.orderType,
          status: OrderStatus.PENDING,
          paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          promptpayQrPayload,
          note: dto.note,
          totalPrice,
          queueNumber,
          items: {
            create: itemCalculations.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              options: item.options,
            })),
          },
        },
        include: {
          items: { include: { menuItem: true } },
          vendor: true,
          student: { select: { id: true, fullName: true, phone: true, email: true } },
        },
      });
    });

    // Notify vendor dashboard in real-time
    this.notificationsService.notifyNewOrder(dto.vendorId, order as unknown as Order);

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: Role,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true, student: true, items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only the vendor owner can update the status of this order');
    }

    const previousStatus = order.status as OrderStatus;
    const newStatus = dto.status;

    let readyAt = order.readyAt;
    let completedAt = order.completedAt;
    let cancelledBy = order.cancelledBy;
    let cancelReason = order.cancelReason;

    if (newStatus === OrderStatus.READY && !readyAt) {
      readyAt = new Date();
    } else if (newStatus === OrderStatus.COMPLETED && !completedAt) {
      completedAt = new Date();
    } else if (newStatus === OrderStatus.CANCELLED) {
      cancelledBy = CancelledBy.VENDOR;
      cancelReason = dto.cancelReason || 'ร้านค้ายกเลิกคำสั่งซื้อ';
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        readyAt,
        completedAt,
        cancelledBy,
        cancelReason,
      },
      include: {
        items: { include: { menuItem: true } },
        vendor: true,
        student: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    // Notify real-time status update to both student app and vendor dashboard
    this.notificationsService.notifyOrderStatusChanged(
      updatedOrder as unknown as Order,
      previousStatus,
      newStatus,
    );

    return updatedOrder;
  }

  async cancelOrderByStudent(orderId: string, studentId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true, student: true, items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.studentId !== studentId) {
      throw new ForbiddenException('Only the student who placed this order can cancel it');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel an order that has already been completed');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('This order is already cancelled');
    }

    if (
      order.status === OrderStatus.ACCEPTED ||
      order.status === OrderStatus.COOKING ||
      order.status === OrderStatus.READY
    ) {
      throw new BadRequestException('ร้านค้ารับออเดอร์แล้ว ไม่สามารถยกเลิกได้ กรุณาติดต่อทางร้านโดยตรง');
    }

    const previousStatus = order.status as OrderStatus;
    const cancelReason = reason || 'ผู้สั่งขอยกเลิกคำสั่งซื้อ';

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledBy: CancelledBy.USER,
        cancelReason,
      },
      include: {
        items: { include: { menuItem: true } },
        vendor: true,
        student: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    this.notificationsService.notifyOrderStatusChanged(
      updatedOrder as unknown as Order,
      previousStatus,
      OrderStatus.CANCELLED,
    );

    return updatedOrder;
  }

  async confirmOrderReceipt(orderId: string, studentId: string) {

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true, student: true, items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.studentId !== studentId) {
      throw new ForbiddenException('Only the student who placed this order can confirm receipt');
    }

    const previousStatus = order.status as OrderStatus;
    const completedAt = new Date();

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt,
      },
      include: {
        items: { include: { menuItem: true } },
        vendor: true,
        student: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    this.notificationsService.notifyOrderStatusChanged(
      updatedOrder as unknown as Order,
      previousStatus,
      OrderStatus.COMPLETED,
    );

    return updatedOrder;
  }


  async getVendorOrders(vendorId: string, status?: OrderStatus, page?: number, limit?: number) {
    const isPaginated = page !== undefined || limit !== undefined;
    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          vendorId,
          ...(status ? { status } : {}),
        },
        include: {
          items: { include: { menuItem: true } },
          student: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { createdAt: 'asc' },
        ...(take ? { take } : {}),
        ...(skip ? { skip } : {}),
      }),
      this.prisma.order.count({
        where: {
          vendorId,
          ...(status ? { status } : {}),
        },
      }),
    ]);

    if (isPaginated) {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : orders.length;
      return {
        data: orders,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      };
    }

    return orders;
  }

  /**
   * Returns orders for a specific student with optional pagination.
   * @param studentId  The student whose orders to fetch.
   * @param requestingUserId  The authenticated user making the request.
   * @param requestingRole  The role of the authenticated user.
   * @param page  Optional page number (1-indexed).
   * @param limit  Optional number of items per page.
   */
  async getStudentOrders(
    studentId: string,
    requestingUserId: string,
    requestingRole: Role,
    page?: number,
    limit?: number,
  ) {
    // 🔒 IDOR Guard: Only allow the student themselves or an Admin to see orders
    if (studentId !== requestingUserId && requestingRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only view your own order history');
    }

    const isPaginated = page !== undefined || limit !== undefined;
    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { studentId },
        include: {
          vendor: { select: { id: true, name: true, logoUrl: true } },
          items: { include: { menuItem: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...(take ? { take } : {}),
        ...(skip ? { skip } : {}),
      }),
      this.prisma.order.count({
        where: { studentId },
      }),
    ]);

    if (isPaginated) {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : orders.length;
      return {
        data: orders,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      };
    }

    return orders;
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        vendor: true,
        items: {
          include: { menuItem: true },
        },
        student: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  /**
   * Verify PromptPay payment by student / mock bank gateway.
   */
  async verifyPayment(orderId: string, studentId: string, transactionId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true, student: true, items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.studentId !== studentId) {
      throw new ForbiddenException('You can only verify payment for your own orders');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
        transactionId: transactionId || `TXN-PP-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      },
      include: {
        items: { include: { menuItem: true } },
        vendor: true,
        student: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    });

    // Notify vendor dashboard in real-time
    this.notificationsService.notifyOrderStatusChanged(
      updatedOrder as unknown as Order,
      order.status as OrderStatus,
      updatedOrder.status as OrderStatus,
    );

    return updatedOrder;
  }

  /**
   * Mark cash payment received at counter by vendor.
   */
  async markCashPaid(orderId: string, vendorUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true, student: true, items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.vendor.ownerId !== vendorUserId) {
      throw new ForbiddenException('Only the vendor owner can mark this order as paid');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
        transactionId: `CASH-${Date.now()}`,
      },
      include: {
        items: { include: { menuItem: true } },
        vendor: true,
        student: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    });

    // Notify real-time
    this.notificationsService.notifyOrderStatusChanged(
      updatedOrder as unknown as Order,
      order.status as OrderStatus,
      updatedOrder.status as OrderStatus,
    );

    return updatedOrder;
  }
}

