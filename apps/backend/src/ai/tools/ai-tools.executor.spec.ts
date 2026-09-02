import { Test, TestingModule } from '@nestjs/testing';
import { AiToolsExecutor } from './ai-tools.executor';
import { AnalyticsService } from '../../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AiToolsExecutor', () => {
  let executor: AiToolsExecutor;
  let analyticsService: AnalyticsService;

  const mockAnalyticsService = {
    getSummary: jest.fn(),
    getPopularItems: jest.fn(),
    getPeakHours: jest.fn(),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiToolsExecutor,
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    executor = module.get<AiToolsExecutor>(AiToolsExecutor);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  it('should execute get_sales_summary tool', async () => {
    mockAnalyticsService.getSummary.mockResolvedValue({ totalRevenue: 1000, totalOrders: 20 });

    const result = await executor.executeTool('get_sales_summary', { period: 'week' }, 'vendor-1');

    expect(analyticsService.getSummary).toHaveBeenCalledWith('vendor-1', 'week');
    expect(result).toEqual({ totalRevenue: 1000, totalOrders: 20 });
  });

  it('should execute get_top_selling_items tool', async () => {
    mockAnalyticsService.getPopularItems.mockResolvedValue([{ name: 'Fried Rice', totalQuantity: 30 }]);

    const result = await executor.executeTool('get_top_selling_items', { limit: 3 }, 'vendor-1');

    expect(analyticsService.getPopularItems).toHaveBeenCalledWith('vendor-1', 3);
    expect(result).toEqual([{ name: 'Fried Rice', totalQuantity: 30 }]);
  });

  it('should execute get_peak_hours tool', async () => {
    mockAnalyticsService.getPeakHours.mockResolvedValue([{ hour: 12, orderCount: 15 }]);

    const result = await executor.executeTool('get_peak_hours', {}, 'vendor-1');

    expect(analyticsService.getPeakHours).toHaveBeenCalledWith('vendor-1');
    expect(result).toEqual([{ hour: 12, orderCount: 15 }]);
  });

  it('should return error object for unknown tool', async () => {
    const result = await executor.executeTool('unknown_tool', {}, 'vendor-1');

    expect(result).toEqual({ error: 'Tool unknown_tool not found' });
  });
});
