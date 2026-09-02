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
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>ช่วงเวลาสั่งอาหารยอดนิยม (Peak Hours)</span>
          </h4>
          <p className="text-xs text-[#475569]">วิเคราะห์ช่วงเวลาที่ลูกค้าสั่งอาหารเยอะที่สุด (08:00 - 21:00 น.)</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold border border-[#FDE68A]">
          จำนวนออเดอร์
        </span>
      </div>

      <div className="h-64 w-full">
        {isLoading || !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#94A3B8] text-xs">
            กำลังประมวลผลช่วงเวลา...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}:00`}
                stroke="#94a3b8"
                fontSize={11}
              />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                labelFormatter={(h) => `${h}:00 - ${Number(h) + 1}:00 น.`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.08)',
                  fontSize: '12px',
                  color: '#0f172a',
                }}
              />
              <Bar
                dataKey="orderCount"
                name="จำนวนออเดอร์"
                fill="#0D9488"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
