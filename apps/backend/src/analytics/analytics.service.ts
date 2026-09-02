import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnalyticsPeriod,
  AnalyticsSummary,
  DailySales,
  PopularMenuItem,
  PeakHour,
  OrderStatus,
} from '@campus-food/shared-types';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(period: AnalyticsPeriod = 'today'): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  async getSummary(vendorId: string, period: AnalyticsPeriod = 'today'): Promise<AnalyticsSummary> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    const { start, end } = this.getDateRange(period);

    // 1. Efficient Status Aggregations using DB groupBy
    const statusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        vendorId,
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    for (const group of statusGroups) {
      if (group.status === OrderStatus.CANCELLED) {
        cancelledOrders = group._count.id;
      } else {
        totalRevenue += Number(group._sum.totalPrice || 0);
        totalOrders += group._count.id;
        if (group.status === OrderStatus.COMPLETED) {
          completedOrders = group._count.id;
        }
      }
    }

    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    // 2. Fetch lightweight order timestamps for Daily Trends & Peak Hours
    const validOrders = await this.prisma.order.findMany({
      where: {
        vendorId,
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate daily sales
    const dailyMap = new Map<string, { totalSales: number; orderCount: number }>();
    for (const order of validOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const current = dailyMap.get(dateStr) || { totalSales: 0, orderCount: 0 };
      current.totalSales += Number(order.totalPrice);
      current.orderCount += 1;
      dailyMap.set(dateStr, current);
    }

    const dailyTrends: DailySales[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      totalSales: Number(data.totalSales.toFixed(2)),
      orderCount: data.orderCount,
    }));

    // 3. Database Aggregated Top Popular Items
    const popularItemsRaw = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          vendorId,
          createdAt: { gte: start, lte: end },
          status: { not: OrderStatus.CANCELLED },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const menuItemIds = popularItemsRaw.map((p) => p.menuItemId);
    const menuItems = menuItemIds.length > 0
      ? await this.prisma.menuItem.findMany({
          where: { id: { in: menuItemIds } },
          select: { id: true, name: true, category: true },
        })
      : [];

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    const popularItems: PopularMenuItem[] = popularItemsRaw.map((p) => {
      const item = menuMap.get(p.menuItemId);
      return {
        menuItemId: p.menuItemId,
        name: item?.name || 'Unknown Item',
        category: item?.category || 'General',
        totalQuantity: p._sum.quantity || 0,
        totalRevenue: Number((p._sum.subtotal || 0).toFixed(2)),
      };
    });

    // 4. Peak Ordering Hours Distribution
    const hourMap = new Map<number, { orderCount: number; totalSales: number }>();
    for (let h = 8; h <= 21; h++) {
      hourMap.set(h, { orderCount: 0, totalSales: 0 });
    }

    for (const order of validOrders) {
      const hour = new Date(order.createdAt).getHours();
      const current = hourMap.get(hour) || { orderCount: 0, totalSales: 0 };
      current.orderCount += 1;
      current.totalSales += Number(order.totalPrice);
      hourMap.set(hour, current);
    }

    const peakHours: PeakHour[] = Array.from(hourMap.entries())
      .map(([hour, data]) => ({
        hour,
        orderCount: data.orderCount,
        totalSales: Number(data.totalSales.toFixed(2)),
      }))
      .sort((a, b) => a.hour - b.hour);

    return {
      vendorId,
      period,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue,
      completedOrders,
      cancelledOrders,
      dailyTrends,
      popularItems,
      peakHours,
    };
  }

  async getPopularItems(vendorId: string, limit: number = 5): Promise<PopularMenuItem[]> {
    const { start, end } = this.getDateRange('month');

    const popularItemsRaw = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          vendorId,
          createdAt: { gte: start, lte: end },
          status: { not: OrderStatus.CANCELLED },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const menuItemIds = popularItemsRaw.map((p) => p.menuItemId);
    if (menuItemIds.length === 0) return [];

    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true, category: true },
    });

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    return popularItemsRaw.map((p) => {
      const item = menuMap.get(p.menuItemId);
      return {
        menuItemId: p.menuItemId,
        name: item?.name || 'Unknown Item',
        category: item?.category || 'General',
        totalQuantity: p._sum.quantity || 0,
        totalRevenue: Number((p._sum.subtotal || 0).toFixed(2)),
      };
    });
  }

  async getPeakHours(vendorId: string): Promise<PeakHour[]> {
    const { start, end } = this.getDateRange('month');

    const validOrders = await this.prisma.order.findMany({
      where: {
        vendorId,
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const hourMap = new Map<number, { orderCount: number; totalSales: number }>();
    for (let h = 8; h <= 21; h++) {
      hourMap.set(h, { orderCount: 0, totalSales: 0 });
    }

    for (const order of validOrders) {
      const hour = new Date(order.createdAt).getHours();
      const current = hourMap.get(hour) || { orderCount: 0, totalSales: 0 };
      current.orderCount += 1;
      current.totalSales += Number(order.totalPrice);
      hourMap.set(hour, current);
    }

    return Array.from(hourMap.entries())
      .map(([hour, data]) => ({
        hour,
        orderCount: data.orderCount,
        totalSales: Number(data.totalSales.toFixed(2)),
      }))
      .sort((a, b) => a.hour - b.hour);
  }
}
