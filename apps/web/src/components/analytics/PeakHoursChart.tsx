'use client';

import React from 'react';
import { PeakHour } from '@campus-food/shared-types';
import { Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PeakHoursChartProps {
  data?: PeakHour[];
  isLoading: boolean;
}

export function PeakHoursChart({ data = [], isLoading }: PeakHoursChartProps) {
  return (
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
        {isLoading || !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            กำลังประมวลผลช่วงเวลา...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
  );
}
