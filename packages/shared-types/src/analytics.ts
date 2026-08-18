export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'custom';

export interface DailySales {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface PopularMenuItem {
  menuItemId: string;
  name: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface PeakHour {
  hour: number;
  orderCount: number;
  totalSales: number;
}

export interface AnalyticsSummary {
  vendorId: string;
  period: AnalyticsPeriod;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  dailyTrends: DailySales[];
  popularItems: PopularMenuItem[];
  peakHours: PeakHour[];
}

export interface AnalyticsQueryDto {
  vendorId: string;
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}
