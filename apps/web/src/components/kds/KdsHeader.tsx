'use client';

import React, { useEffect, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  ChefHat,
  Tv,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

interface KdsHeaderProps {
  vendorName: string;
  onRefresh: () => void;
  isRefetching: boolean;
  totalActiveCount: number;
}

export function KdsHeader({
  vendorName,
  onRefresh,
  isRefetching,
  totalActiveCount,
}: KdsHeaderProps) {
  const router = useRouter();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Digital Clock
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
          year: 'numeric',
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleOpenCustomerDisplay = () => {
    window.open(
      '/queue-display',
      'customer_queue_display',
      'width=1280,height=800,menubar=no,status=no,toolbar=no,resizable=yes',
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 py-3 shrink-0 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Back / Logo / Store Name / Active Queue Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (window.opener) {
              window.close();
            } else {
              router.push('/dashboard/orders');
            }
          }}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="กลับหน้าระบบหลัก"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight truncate max-w-[200px] lg:max-w-[320px]">
                {vendorName || 'ร้านค้า'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-brand-700 border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                จอห้องครัว (KDS)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              คิวที่ต้องทำ: <span className="font-bold text-brand-600">{totalActiveCount} ออเดอร์</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Digital Clock */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700">
        <Clock className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-black font-mono tracking-wider text-slate-900">{timeStr}</span>
        <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-2">{dateStr}</span>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2">
        {/* Open POS Screen Button */}
        <button
          onClick={() => window.open('/pos', 'pos_window', 'width=1280,height=800,menubar=no,status=no,toolbar=no,resizable=yes')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          title="เปิดหน้าต่างคิดเงินหน้าร้าน POS"
        >
          <span>🖥️</span>
          <span>คิดเงิน POS</span>
        </button>

        {/* Open Customer Queue Screen Button */}
        <button
          onClick={handleOpenCustomerDisplay}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs transition-all active:scale-95"
          title="เปิดหน้าต่างจอเรียกคิวลูกค้าหน้าร้านแยกออกมา"
        >
          <Tv className="w-3.5 h-3.5 text-emerald-600" />
          <span>เปิดจอเรียกลูกค้า 📺</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs transition-colors"
          title="รีเฟรชออเดอร์"
        >
          <RefreshCw className={clsx('w-4 h-4', isRefetching && 'animate-spin text-brand-600')} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs transition-colors"
          title={isFullscreen ? 'ออกจากเต็มจอ' : 'แสดงเต็มจอ'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
