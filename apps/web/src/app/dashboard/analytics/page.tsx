'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/dashboard/Navbar';
import {
  PeriodFilterToolbar,
  KpiCard,
  RevenueChart,
  PeakHoursChart,
  TopItemsTable,
} from '@/components/analytics';
import { AnalyticsSummary, AnalyticsPeriod } from '@campus-food/shared-types';
import { DollarSign, ShoppingBag, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { vendor } = useAuth();
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');

  // Fetch Analytics Summary
  const { data: analytics, isLoading } = useQuery<AnalyticsSummary | null>({
    queryKey: ['vendor-analytics', vendor?.id, period],
    queryFn: async () => {
      if (!vendor?.id) return null;
      return apiClient<AnalyticsSummary>(`/analytics/${vendor.id}/summary?period=${period}`);
    },
    enabled: !!vendor?.id,
  });

  const completionRate =
    analytics && analytics.totalOrders > 0
      ? `${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}%`
      : '100%';

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="สถิติและวิเคราะห์ยอดขาย"
        description="รายงานรายได้ ยอดขายรายวัน เมนูยอดนิยม และชั่วโมงเร่งด่วนจากข้อมูลจริงของร้าน"
      />

      <div className="p-6 space-y-6 flex-1">
        {/* Period Filter Toolbar Subcomponent */}
        <PeriodFilterToolbar period={period} onPeriodChange={setPeriod} />

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="ยอดขายรวม"
            value={`฿${analytics?.totalRevenue?.toLocaleString() || '0'}`}
            subtitle="+ รายได้สุทธิที่คำนวณจริง"
            icon={DollarSign}
            iconBgClass="bg-emerald-50 border-emerald-200"
            iconTextClass="text-emerald-700"
            subtitleTextClass="text-emerald-700"
          />

          <KpiCard
            title="จำนวนออเดอร์ทั้งหมด"
            value={analytics?.totalOrders || 0}
            unit="รายการ"
            subtitle={`สำเร็จแล้ว ${analytics?.completedOrders || 0}`}
            icon={ShoppingBag}
            iconBgClass="bg-[#CCFBF1] border-[#99F6E4]"
            iconTextClass="text-[#0D9488]"
            subtitleTextClass="text-[#0D9488]"
          />

          <KpiCard
            title="ยอดเฉลี่ยต่อบิล (AOV)"
            value={`฿${analytics?.averageOrderValue || 0}`}
            subtitle="เฉลี่ยต่อคำสั่งซื้อ"
            icon={TrendingUp}
            iconBgClass="bg-indigo-50 border-indigo-200"
            iconTextClass="text-indigo-700"
            subtitleTextClass="text-indigo-700"
          />

          <KpiCard
            title="อัตราทำออเดอร์สำเร็จ"
            value={completionRate}
            subtitle={`ยกเลิก ${analytics?.cancelledOrders || 0} รายการ`}
            icon={CheckCircle2}
            iconBgClass="bg-amber-50 border-amber-200"
            iconTextClass="text-amber-700"
            subtitleTextClass="text-amber-700"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={analytics?.dailyTrends} isLoading={isLoading} />
          <PeakHoursChart data={analytics?.peakHours} isLoading={isLoading} />
        </div>

        {/* Top Selling Dishes Table */}
        <TopItemsTable popularItems={analytics?.popularItems} isLoading={isLoading} />
      </div>
    </div>
  );
}
