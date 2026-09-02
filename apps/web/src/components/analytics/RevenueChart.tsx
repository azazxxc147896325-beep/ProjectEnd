'use client';

import React from 'react';
import { DailySales } from '@campus-food/shared-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface RevenueChartProps {
  data?: DailySales[];
  isLoading: boolean;
}

export function RevenueChart({ data = [], isLoading }: RevenueChartProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#0F172A]">แนวโน้มยอดขาย (Revenue Trend)</h4>
          <p className="text-xs text-[#475569]">กราฟแสดงรายได้ตามช่วงเวลา</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#CCFBF1] text-[#0D9488] text-[11px] font-bold border border-[#99F6E4]">
          บาท
        </span>
      </div>

      <div className="h-64 w-full">
        {isLoading || !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#94A3B8] text-xs">
            ยังไม่มีข้อมูลแนวโน้มยอดขายในช่วงนี้
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.08)',
                  fontSize: '12px',
                  color: '#0f172a',
                }}
              />
              <Area
                type="monotone"
                dataKey="totalSales"
                name="ยอดขาย (฿)"
                stroke="#0D9488"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
