import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@campus-food/shared-types';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    vendor: {
      findUnique: jest.fn(),
    },
    order: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should calculate analytics summary with database aggregations', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({ id: 'vendor-1', name: 'Somjai' });

      mockPrismaService.order.groupBy.mockResolvedValue([
        { status: OrderStatus.COMPLETED, _count: { id: 10 }, _sum: { totalPrice: 500 } },
        { status: OrderStatus.ACCEPTED, _count: { id: 2 }, _sum: { totalPrice: 100 } },
        { status: OrderStatus.CANCELLED, _count: { id: 1 }, _sum: { totalPrice: 50 } },
      ]);

      mockPrismaService.order.findMany.mockResolvedValue([
        { totalPrice: 50, createdAt: new Date('2026-09-02T10:00:00Z') },
        { totalPrice: 60, createdAt: new Date('2026-09-02T12:00:00Z') },
      ]);

      mockPrismaService.orderItem.groupBy.mockResolvedValue([
        { menuItemId: 'item-1', _sum: { quantity: 5, subtotal: 250 } },
      ]);

      mockPrismaService.menuItem.findMany.mockResolvedValue([
        { id: 'item-1', name: 'Basil Pork', category: 'Main' },
      ]);

      const result = await service.getSummary('vendor-1', 'today');

      expect(result.vendorId).toBe('vendor-1');
      expect(result.totalRevenue).toBe(600);
      expect(result.totalOrders).toBe(12);
      expect(result.completedOrders).toBe(10);
      expect(result.cancelledOrders).toBe(1);
      expect(result.averageOrderValue).toBe(50);
      expect(result.popularItems).toHaveLength(1);
      expect(result.popularItems[0].name).toBe('Basil Pork');
      expect(result.popularItems[0].totalQuantity).toBe(5);
    });

    it('should throw NotFoundException if vendor does not exist', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue(null);

      await expect(service.getSummary('non-existent-vendor')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPopularItems', () => {
    it('should return top popular items using database aggregation', async () => {
      mockPrismaService.orderItem.groupBy.mockResolvedValue([
        { menuItemId: 'item-1', _sum: { quantity: 15, subtotal: 750 } },
        { menuItemId: 'item-2', _sum: { quantity: 10, subtotal: 500 } },
      ]);

      mockPrismaService.menuItem.findMany.mockResolvedValue([
        { id: 'item-1', name: 'Crispy Pork', category: 'Rice' },
        { id: 'item-2', name: 'Boat Noodle', category: 'Noodle' },
      ]);

      const items = await service.getPopularItems('vendor-1', 2);

      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('Crispy Pork');
      expect(items[0].totalQuantity).toBe(15);
      expect(items[1].name).toBe('Boat Noodle');
      expect(items[1].totalQuantity).toBe(10);
    });
  });

  describe('getPeakHours', () => {
    it('should return 24-hour peak hours distribution', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([
        { totalPrice: 100, createdAt: new Date('2026-09-02T12:00:00Z') },
        { totalPrice: 150, createdAt: new Date('2026-09-02T12:30:00Z') },
      ]);

      const hours = await service.getPeakHours('vendor-1');

      expect(hours).toBeDefined();
      expect(Array.isArray(hours)).toBe(true);
    });
  });
});
