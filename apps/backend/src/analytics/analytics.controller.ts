import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role, AnalyticsPeriod } from '@campus-food/shared-types';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':vendorId/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive analytics summary (Revenue, Orders, Trends, Peak Hours, Top Items)' })
  @ApiQuery({ name: 'period', enum: ['today', 'week', 'month'], required: false })
  async getSummary(
    @Param('vendorId') vendorId: string,
    @Query('period') period?: AnalyticsPeriod,
  ) {
    return this.analyticsService.getSummary(vendorId, period || 'today');
  }

  @Get(':vendorId/popular-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top popular menu items' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularItems(
    @Param('vendorId') vendorId: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getPopularItems(vendorId, limit ? parseInt(limit, 10) : 5);
  }

  @Get(':vendorId/peak-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get peak ordering hours distribution' })
  async getPeakHours(@Param('vendorId') vendorId: string) {
    return this.analyticsService.getPeakHours(vendorId);
  }
}
