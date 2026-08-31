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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => onPeriodChange('today')}
          className={clsx(
            'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
            period === 'today'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          )}
        >
          📅 วันนี้
        </button>
        <button
          onClick={() => onPeriodChange('week')}
          className={clsx(
            'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
            period === 'week'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          )}
        >
          📊 7 วันล่าสุด
        </button>
        <button
          onClick={() => onPeriodChange('month')}
          className={clsx(
            'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
            period === 'month'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          )}
        >
          📈 30 วันล่าสุด
        </button>
      </div>

      <span className="text-xs text-slate-500 flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5 text-brand-600" />
        <span>คำนวณจากฐานข้อมูล PostgreSQL จริง</span>
      </span>
    </div>
  );
}
