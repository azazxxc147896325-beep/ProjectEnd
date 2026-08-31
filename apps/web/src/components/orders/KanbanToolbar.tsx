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
  onOpenKds?: () => void;
  onOpenCustomerDisplay?: () => void;
}

export function KanbanToolbar({
  filterType,
  onFilterChange,
  activeOrderCount,
  onRefresh,
  isRefetching,
  onOpenKds,
  onOpenCustomerDisplay,
}: KanbanToolbarProps) {
  const handleOpenKds = () => {
    if (onOpenKds) {
      onOpenKds();
    } else {
      window.open('/kds', 'kds_kitchen_display', 'width=1280,height=800,menubar=no,status=no,toolbar=no,resizable=yes');
    }
  };

  const handleOpenCustomerDisplay = () => {
    if (onOpenCustomerDisplay) {
      onOpenCustomerDisplay();
    } else {
      window.open('/queue-display', 'customer_queue_display', 'width=1280,height=800,menubar=no,status=no,toolbar=no,resizable=yes');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => onFilterChange('all')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
            filterType === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          )}
        >
          ทั้งหมด ({activeOrderCount})
        </button>
        <button
          onClick={() => onFilterChange('dine_in')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
            filterType === 'dine_in'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          )}
        >
          🍽️ ทานที่ร้าน
        </button>
        <button
          onClick={() => onFilterChange('takeaway')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
            filterType === 'takeaway'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          )}
        >
          🛍️ กลับบ้าน
        </button>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Button: คิดเงินหน้าร้าน (POS) */}
        <button
          onClick={() => window.open('/pos', 'pos_window', 'width=1280,height=800,menubar=no,status=no,toolbar=no,resizable=yes')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
          title="เปิดหน้าจอคิดเงินด่วนหน้าร้าน POS"
        >
          <span>🖥️</span>
          <span>คิดเงิน POS</span>
        </button>

        {/* Button 1: จอห้องครัว (KDS) */}
        <button
          onClick={handleOpenKds}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white text-xs font-bold shadow-sm shadow-brand-500/20 active:scale-95 transition-all"
          title="เปิดจอคิวสำหรับห้องครัวบน iPad / แท็บเล็ต"
        >
          <span>🍳</span>
          <span>จอห้องครัว (KDS)</span>
        </button>

        {/* Button 2: จอเรียกคิวลูกค้า */}
        <button
          onClick={handleOpenCustomerDisplay}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs active:scale-95 transition-all"
          title="เปิดจอแสดงผลเรียกคิวสำหรับลูกค้าหน้าร้าน / จอ TV"
        >
          <span>📺</span>
          <span>จอเรียกคิวลูกค้า</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition-colors"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', isRefetching && 'animate-spin text-brand-600')} />
          <span>รีเฟรช</span>
        </button>
      </div>
    </div>
  );
}
