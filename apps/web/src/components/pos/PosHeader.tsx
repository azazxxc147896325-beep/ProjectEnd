'use client';

import React, { useEffect, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Store,
  Tv,
  ChefHat,
  ArrowLeft,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

interface PosHeaderProps {
  vendorName: string;
  isOpen: boolean;
  onRefresh: () => void;
  isRefetching: boolean;
  todayOrderCount: number;
}

export function PosHeader({
  vendorName,
  isOpen,
  onRefresh,
  isRefetching,
  todayOrderCount,
}: PosHeaderProps) {
  const router = useRouter();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      setDateStr(
        now.toLocaleDateString('th-TH', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 shrink-0 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Back / Store Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          title="กลับแดชบอร์ดหลัก"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight truncate max-w-[200px] lg:max-w-[300px]">
                {vendorName || 'ร้านค้า'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                🖥️ คิดเงินหน้าร้าน POS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              ออเดอร์วันนี้: <span className="font-bold text-brand-600">{todayOrderCount} บิล</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Clock */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700">
        <Clock className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-black font-mono tracking-wider text-slate-900">{timeStr}</span>
        <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-2">{dateStr}</span>
      </div>

      {/* Right: Quick Links & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.open('/kds', 'kds_window', 'width=1280,height=800')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
          title="เปิดจอห้องครัว KDS"
        >
          <ChefHat className="w-3.5 h-3.5 text-brand-600" />
          <span>จอห้องครัว 🍳</span>
        </button>

        <button
          onClick={() => window.open('/queue-display', 'queue_window', 'width=1280,height=800')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
          title="เปิดจอเรียกคิวลูกค้าหน้าร้าน"
        >
          <Tv className="w-3.5 h-3.5 text-emerald-600" />
          <span>จอเรียกลูกค้า 📺</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs transition-colors"
          title="รีเฟรชเมนู"
        >
          <RefreshCw className={clsx('w-4 h-4', isRefetching && 'animate-spin text-brand-600')} />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs transition-colors"
          title={isFullscreen ? 'ออกจากเต็มจอ' : 'แสดงเต็มจอ'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
