import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GetSalesSummaryInput, GetTopSellingItemsInput } from './ai-tools.definitions';
import { AnalyticsPeriod } from '@campus-food/shared-types';

@Injectable()
export class AiToolsExecutor {
  private readonly logger = new Logger(AiToolsExecutor.name);

  constructor(
    private analyticsService: AnalyticsService,
    private prisma: PrismaService,
  ) {}

  async executeTool(name: string, input: Record<string, any>, vendorId: string): Promise<any> {
    switch (name) {
      case 'get_sales_summary': {
        const period: AnalyticsPeriod = (input as GetSalesSummaryInput).period || 'today';
        return this.analyticsService.getSummary(vendorId, period);
      }
      case 'get_top_selling_items': {
        const limit = (input as GetTopSellingItemsInput).limit || 5;
        return this.analyticsService.getPopularItems(vendorId, limit);
      }
      case 'get_peak_hours': {
        return this.analyticsService.getPeakHours(vendorId);
      }
      default: {
        this.logger.warn(`Unknown AI tool requested: ${name}`);
        return { error: `Tool ${name} not found` };
      }
    }
  }
}
