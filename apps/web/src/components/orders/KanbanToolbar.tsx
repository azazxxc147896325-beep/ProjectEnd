'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface KanbanToolbarProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  activeOrderCount: number;
  onRefresh: () => void;
  isRefetching: boolean;
}

export function KanbanToolbar({
  filterType,
  onFilterChange,
  activeOrderCount,
  onRefresh,
  isRefetching,
}: KanbanToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => onFilterChange('all')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
            filterType === 'all'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          ทั้งหมด ({activeOrderCount})
        </button>
        <button
          onClick={() => onFilterChange('dine_in')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
            filterType === 'dine_in'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          🍽️ ทานที่ร้าน
        </button>
        <button
          onClick={() => onFilterChange('takeaway')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
            filterType === 'takeaway'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          🛍️ กลับบ้าน
        </button>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefetching}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
      >
        <RefreshCw className={clsx('w-3.5 h-3.5', isRefetching && 'animate-spin text-brand-400')} />
        <span>รีเฟรช</span>
      </button>
    </div>
  );
}
