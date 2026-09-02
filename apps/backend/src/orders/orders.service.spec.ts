import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderType, OrderStatus, Role } from '@campus-food/shared-types';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let notifications: NotificationsService;

  const mockPrismaService = {
    order: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    vendor: {
      findUnique: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockNotificationsService = {
    notifyNewOrder: jest.fn(),
    notifyOrderStatusChanged: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    notifications = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('calculateTotalPrice', () => {
    it('should correctly calculate total price and subtotals for multiple items', () => {
      const items = [
        { quantity: 2, unitPrice: 50.0 }, // 100.00
        { quantity: 1, unitPrice: 35.5 }, // 35.50
        { quantity: 3, unitPrice: 15.25 }, // 45.75
      ];

      const result = service.calculateTotalPrice(items);

      expect(result.totalPrice).toBe(181.25);
      expect(result.validatedItems).toHaveLength(3);
      expect(result.validatedItems[0].subtotal).toBe(100.0);
      expect(result.validatedItems[1].subtotal).toBe(35.5);
      expect(result.validatedItems[2].subtotal).toBe(45.75);
    });

    it('should handle zero quantity or empty items array gracefully', () => {
      const result = service.calculateTotalPrice([]);
      expect(result.totalPrice).toBe(0);
      expect(result.validatedItems).toHaveLength(0);
    });
  });

  describe('createOrder validation', () => {
    it('should throw BadRequestException if vendor is currently closed', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        isOpen: false,
      });

      await expect(
        service.createOrder('student-1', {
          vendorId: 'vendor-1',
          orderType: OrderType.DINE_IN,
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if a menu item is not available', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        isOpen: true,
      });

      mockPrismaService.menuItem.findMany.mockResolvedValue([
        {
          id: 'item-1',
          name: 'Crispy Pork',
          price: 60,
          isAvailable: false, // Out of stock
        },
      ]);

      await expect(
        service.createOrder('student-1', {
          vendorId: 'vendor-1',
          orderType: OrderType.DINE_IN,
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create order and generate PromptPay QR payload with vendor custom promptpayId', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        name: 'Somjai Kitchen',
        promptpayId: '0899998888',
        isOpen: true,
      });

      mockPrismaService.menuItem.findMany.mockResolvedValue([
        {
          id: 'item-1',
          name: 'Basil Pork',
          price: 50,
          isAvailable: true,
        },
      ]);

      const createdOrderMock = {
        id: 'order-pp-1',
        studentId: 'student-1',
        vendorId: 'vendor-1',
        totalPrice: 100,
        queueNumber: 1,
        status: OrderStatus.PENDING,
        promptpayQrPayload: expect.any(String),
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          order: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((args) => {
              expect(args.data.promptpayQrPayload).toBeDefined();
              expect(args.data.promptpayQrPayload).toContain('0066899998888');
              return createdOrderMock;
            }),
          },
        };
        return callback(txMock);
      });

      const order = await service.createOrder('student-1', {
        vendorId: 'vendor-1',
        orderType: OrderType.DINE_IN,
        paymentMethod: 'promptpay' as any,
        items: [{ menuItemId: 'item-1', quantity: 2 }],
      });

      expect(order).toEqual(createdOrderMock);
      expect(mockNotificationsService.notifyNewOrder).toHaveBeenCalled();
    });
  });

  describe('cancelOrderByStudent', () => {
    it('should cancel order successfully if it is still PENDING', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.PENDING,
        vendor: { id: 'vendor-1' },
      });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancelOrderByStudent('order-1', 'student-1', 'Changed mind');
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(mockNotificationsService.notifyOrderStatusChanged).toHaveBeenCalledWith(
        expect.anything(),
        OrderStatus.PENDING,
        OrderStatus.CANCELLED,
      );
    });

    it('should throw BadRequestException if order is already ACCEPTED, COOKING or READY', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.ACCEPTED,
        vendor: { id: 'vendor-1' },
      });

      await expect(
        service.cancelOrderByStudent('order-1', 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if another student tries to cancel the order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.PENDING,
        vendor: { id: 'vendor-1' },
      });

      await expect(
        service.cancelOrderByStudent('order-1', 'intruder-student-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('confirmOrderReceipt', () => {
    it('should allow the student to confirm order completion', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.READY,
        vendor: { id: 'vendor-1' },
      });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.COMPLETED,
      });

      const result = await service.confirmOrderReceipt('order-1', 'student-1');
      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw ForbiddenException if another user tries to confirm receipt', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.READY,
      });

      await expect(
        service.confirmOrderReceipt('order-1', 'wrong-student-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStudentOrders (IDOR Protection & Pagination)', () => {
    it('should allow student to view their own orders', async () => {
      const mockOrders = [{ id: 'order-1', studentId: 'student-1' }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getStudentOrders('student-1', 'student-1', Role.STUDENT);
      expect(result).toEqual(mockOrders);
    });

    it('should allow Admin to view any student orders', async () => {
      const mockOrders = [{ id: 'order-1', studentId: 'student-1' }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getStudentOrders('student-1', 'admin-id', Role.ADMIN);
      expect(result).toEqual(mockOrders);
    });

    it('should throw ForbiddenException if student tries to view another student orders (IDOR)', async () => {
      await expect(
        service.getStudentOrders('student-target', 'student-attacker', Role.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return paginated result when page and limit are provided', async () => {
      const mockOrders = [{ id: 'order-1' }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(25);

      const result = (await service.getStudentOrders(
        'student-1',
        'student-1',
        Role.STUDENT,
        2,
        10,
      )) as any;

      expect(result.data).toEqual(mockOrders);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully for own order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.PENDING,
        paymentStatus: 'pending',
      });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'paid',
        transactionId: 'TXN-123',
      });

      const res = await service.verifyPayment('order-1', 'student-1', 'TXN-123');
      expect(res.paymentStatus).toBe('paid');
      expect(mockNotificationsService.notifyOrderStatusChanged).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if another student tries to verify payment', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.PENDING,
      });

      await expect(
        service.verifyPayment('order-1', 'intruder-student-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order is cancelled', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        status: OrderStatus.CANCELLED,
      });

      await expect(
        service.verifyPayment('order-1', 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markPaid', () => {
    it('should allow vendor owner to mark order paid', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        vendor: { ownerId: 'vendor-owner-1' },
      });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'paid',
      });

      const res = await service.markPaid('order-1', 'vendor-owner-1', Role.VENDOR);
      expect(res.paymentStatus).toBe('paid');
      expect(mockNotificationsService.notifyOrderStatusChanged).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if another vendor tries to mark paid', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING,
        vendor: { ownerId: 'vendor-owner-1' },
      });

      await expect(
        service.markPaid('order-1', 'different-vendor-owner-2', Role.VENDOR),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOrderById (IDOR Protection)', () => {
    const mockOrder = {
      id: 'order-target-1',
      studentId: 'student-owner-1',
      vendor: { ownerId: 'vendor-owner-1' },
      items: [],
      student: { id: 'student-owner-1', fullName: 'Target Student' },
    };

    it('should allow the student who placed the order to view it', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const res = await service.getOrderById(
        'order-target-1',
        'student-owner-1',
        Role.STUDENT,
      );

      expect(res).toEqual(mockOrder);
    });

    it('should allow the vendor owner to view the order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const res = await service.getOrderById(
        'order-target-1',
        'vendor-owner-1',
        Role.VENDOR,
      );

      expect(res).toEqual(mockOrder);
    });

    it('should allow Admin to view any order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const res = await service.getOrderById(
        'order-target-1',
        'admin-user-id',
        Role.ADMIN,
      );

      expect(res).toEqual(mockOrder);
    });

    it('should throw ForbiddenException if another student tries to view the order (IDOR)', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getOrderById('order-target-1', 'intruder-student-2', Role.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrderById('non-existent-order', 'student-1', Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrderStatus (State Machine Validation)', () => {
    it('should allow valid transition from PENDING to ACCEPTED and COOKING', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING,
        vendor: { ownerId: 'vendor-owner-1' },
      });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.ACCEPTED,
      });

      const res = await service.updateOrderStatus(
        'order-1',
        'vendor-owner-1',
        Role.VENDOR,
        { status: OrderStatus.ACCEPTED },
      );

      expect(res.status).toBe(OrderStatus.ACCEPTED);
      expect(mockNotificationsService.notifyOrderStatusChanged).toHaveBeenCalled();
    });

    it('should allow valid transition from COOKING to READY', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.COOKING,
        vendor: { ownerId: 'vendor-owner-1' },
      });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.READY,
        readyAt: expect.any(Date),
      });

      const res = await service.updateOrderStatus(
        'order-1',
        'vendor-owner-1',
        Role.VENDOR,
        { status: OrderStatus.READY },
      );

      expect(res.status).toBe(OrderStatus.READY);
    });

    it('should throw BadRequestException on invalid jump from PENDING directly to COMPLETED', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING,
        vendor: { ownerId: 'vendor-owner-1' },
      });

      await expect(
        service.updateOrderStatus(
          'order-1',
          'vendor-owner-1',
          Role.VENDOR,
          { status: OrderStatus.COMPLETED },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when attempting to transition a COMPLETED order (terminal state)', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.COMPLETED,
        vendor: { ownerId: 'vendor-owner-1' },
      });

      await expect(
        service.updateOrderStatus(
          'order-1',
          'vendor-owner-1',
          Role.VENDOR,
          { status: OrderStatus.COOKING },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when attempting to transition a CANCELLED order (terminal state)', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CANCELLED,
        vendor: { ownerId: 'vendor-owner-1' },
      });

      await expect(
        service.updateOrderStatus(
          'order-1',
          'vendor-owner-1',
          Role.VENDOR,
          { status: OrderStatus.READY },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if another vendor tries to update order status', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING,
        vendor: { ownerId: 'vendor-owner-1' },
      });

      await expect(
        service.updateOrderStatus(
          'order-1',
          'unauthorized-vendor-2',
          Role.VENDOR,
          { status: OrderStatus.ACCEPTED },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

