'use client';

import React from 'react';
import { AnalyticsPeriod } from '@campus-food/shared-types';
import { Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface PeriodFilterToolbarProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

export function PeriodFilterToolbar({ period, onPeriodChange }: PeriodFilterToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => onPeriodChange('today')}
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
          onClick={() => onPeriodChange('week')}
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
          onClick={() => onPeriodChange('month')}
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
  );
}
