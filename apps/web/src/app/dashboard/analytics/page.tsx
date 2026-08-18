'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/dashboard/Navbar';
import { AnalyticsSummary, AnalyticsPeriod } from '@campus-food/shared-types';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';

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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="สถิติและวิเคราะห์ยอดขาย"
        description="รายงานรายได้ ยอดขายรายวัน เมนูยอดนิยม และชั่วโมงเร่งด่วนจากข้อมูลจริงของร้าน"
      />

      <div className="p-6 space-y-6 flex-1">
        {/* Period Filter Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setPeriod('today')}
              className={clsx(
                'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all',
                period === 'today'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              📅 วันนี้
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={clsx(
                'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all',
                period === 'week'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              📊 7 วันล่าสุด
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={clsx(
                'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all',
                period === 'month'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              📈 30 วันล่าสุด
            </button>
          </div>

          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>คำนวณจากฐานข้อมูล PostgreSQL จริง</span>
          </span>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-2 relative overflow-hidden shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">ยอดขายรวม</p>
            <h3 className="text-2xl font-black text-white">
              ฿{analytics?.totalRevenue?.toLocaleString() || '0'}
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold">+ รายได้สุทธิที่คำนวณจริง</span>
          </div>

          {/* Total Orders */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-2 relative overflow-hidden shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">จำนวนออเดอร์ทั้งหมด</p>
            <h3 className="text-2xl font-black text-white">
              {analytics?.totalOrders || 0} <span className="text-sm font-normal text-slate-400">รายการ</span>
            </h3>
            <span className="text-[11px] text-brand-400 font-semibold">สำเร็จแล้ว {analytics?.completedOrders || 0}</span>
          </div>

          {/* Average Order Value */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-2 relative overflow-hidden shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">ยอดเฉลี่ยต่อบิล (AOV)</p>
            <h3 className="text-2xl font-black text-white">
              ฿{analytics?.averageOrderValue || 0}
            </h3>
            <span className="text-[11px] text-violet-400 font-semibold">เฉลี่ยต่อคำสั่งซื้อ</span>
          </div>

          {/* Completion Rate */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-2 relative overflow-hidden shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">อัตราทำออเดอร์สำเร็จ</p>
            <h3 className="text-2xl font-black text-white">
              {analytics && analytics.totalOrders > 0
                ? `${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}%`
                : '100%'}
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold">
              ยกเลิก {analytics?.cancelledOrders || 0} รายการ
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-100">แนวโน้มยอดขาย (Revenue Trend)</h4>
                <p className="text-xs text-slate-400">กราฟแสดงรายได้ตามช่วงเวลา</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 text-[11px] font-bold">
                บาท
              </span>
            </div>

            <div className="h-64 w-full">
              {isLoading || !analytics?.dailyTrends || analytics.dailyTrends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  ยังไม่มีข้อมูลแนวโน้มยอดขายในช่วงนี้
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyTrends}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalSales"
                      name="ยอดขาย (฿)"
                      stroke="#f97316"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>ช่วงเวลาสั่งอาหารยอดนิยม (Peak Hours)</span>
                </h4>
                <p className="text-xs text-slate-400">วิเคราะห์ช่วงเวลาที่ลูกค้าสั่งอาหารเยอะที่สุด (08:00 - 21:00 น.)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold">
                จำนวนออเดอร์
              </span>
            </div>

            <div className="h-64 w-full">
              {isLoading || !analytics?.peakHours ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  กำลังประมวลผลช่วงเวลา...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(h) => `${h}:00`}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      labelFormatter={(h) => `${h}:00 - ${Number(h) + 1}:00 น.`}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="orderCount"
                      name="จำนวนออเดอร์"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Dishes Table */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">อันดับเมนูอาหารขายดี (Top Popular Items)</h4>
                <p className="text-xs text-slate-400">คำนวณจากจำนวนจานที่สั่งและรายได้รวมจริง</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">อันดับ</th>
                  <th className="pb-3 font-semibold">ชื่อเมนู</th>
                  <th className="pb-3 font-semibold">หมวดหมู่</th>
                  <th className="pb-3 font-semibold text-right">จำนวนที่ขายได้ (จาน)</th>
                  <th className="pb-3 font-semibold text-right">ยอดขายรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading || !analytics?.popularItems || analytics.popularItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      ยังไม่พบประวัติเมนูขายดีในช่วงเวลานี้
                    </td>
                  </tr>
                ) : (
                  analytics.popularItems.map((item, idx) => (
                    <tr key={item.menuItemId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 font-bold">
                        <span
                          className={clsx(
                            'w-6 h-6 rounded-lg flex items-center justify-center text-xs',
                            idx === 0
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950 font-bold'
                              : idx === 2
                              ? 'bg-amber-800 text-white font-bold'
                              : 'text-slate-400',
                          )}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-100">{item.name}</td>
                      <td className="py-3.5 text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">{item.totalQuantity} จาน</td>
                      <td className="py-3.5 text-right font-black text-brand-400">
                        ฿{item.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
