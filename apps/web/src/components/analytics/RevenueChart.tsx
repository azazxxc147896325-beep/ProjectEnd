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
        {isLoading || !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            ยังไม่มีข้อมูลแนวโน้มยอดขายในช่วงนี้
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
  );
}
