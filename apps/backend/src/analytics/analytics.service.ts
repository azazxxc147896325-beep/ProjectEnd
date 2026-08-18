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

    // Fetch all non-cancelled orders within range
    const orders = await this.prisma.order.findMany({
      where: {
        vendorId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const validOrders = orders.filter((o) => o.status !== OrderStatus.CANCELLED);
    const completedOrders = orders.filter((o) => o.status === OrderStatus.COMPLETED).length;
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;

    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

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

    // Aggregate popular items
    const itemMap = new Map<string, { name: string; category: string; totalQuantity: number; totalRevenue: number }>();
    for (const order of validOrders) {
      for (const item of order.items) {
        const key = item.menuItemId;
        const current = itemMap.get(key) || {
          name: item.menuItem?.name || 'Unknown Item',
          category: item.menuItem?.category || 'General',
          totalQuantity: 0,
          totalRevenue: 0,
        };
        current.totalQuantity += item.quantity;
        current.totalRevenue += Number(item.subtotal);
        itemMap.set(key, current);
      }
    }

    const popularItems: PopularMenuItem[] = Array.from(itemMap.entries())
      .map(([menuItemId, data]) => ({
        menuItemId,
        name: data.name,
        category: data.category,
        totalQuantity: data.totalQuantity,
        totalRevenue: Number(data.totalRevenue.toFixed(2)),
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    // Aggregate peak ordering hours (0 - 23)
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

  async getPopularItems(vendorId: string, limit: number = 5) {
    const summary = await this.getSummary(vendorId, 'month');
    return summary.popularItems.slice(0, limit);
  }

  async getPeakHours(vendorId: string) {
    const summary = await this.getSummary(vendorId, 'month');
    return summary.peakHours;
  }
}
