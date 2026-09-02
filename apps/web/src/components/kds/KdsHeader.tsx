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
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

interface KdsHeaderProps {
  vendorName: string;
  onRefresh: () => void;
  isRefetching: boolean;
  totalActiveCount: number;
  onOpenWalkInOrder?: () => void;
}

export function KdsHeader({
  vendorName,
  onRefresh,
  isRefetching,
  totalActiveCount,
  onOpenWalkInOrder,
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

  const handleOpenSunmiDisplay = () => {
    window.open(
      '/sunmi',
      'sunmi_customer_display',
      'width=420,height=840,menubar=no,status=no,toolbar=no,resizable=yes',
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 lg:px-6 py-3 shrink-0 shadow-xs flex flex-wrap items-center justify-between gap-3">
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
          className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#CCFBF1] border border-[#E2E8F0] text-[#475569] hover:text-[#0D9488] transition-colors"
          title="กลับหน้าระบบหลัก"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black text-[#0F172A] tracking-tight truncate max-w-[200px] lg:max-w-[320px]">
                {vendorName || 'ร้านค้า'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
                จอห้องครัว (KDS)
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium">
              คิวที่ต้องทำ: <span className="font-bold text-[#0D9488]">{totalActiveCount} ออเดอร์</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Digital Clock */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-[#475569]">
        <Clock className="w-4 h-4 text-[#0D9488]" />
        <span className="text-sm font-black font-mono tracking-wider text-[#0F172A]">{timeStr}</span>
        <span className="text-xs text-[#94A3B8] font-medium border-l border-[#E2E8F0] pl-2">{dateStr}</span>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2">
        {/* Walk-in Order Taking Button inside KDS */}
        {onOpenWalkInOrder && (
          <button
            onClick={onOpenWalkInOrder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#0D9488] hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all active:scale-95 animate-pulse-subtle"
            title="กดเพื่อเปิดเมนูสั่งอาหารหน้าร้านทันที"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ สั่งอาหารหน้าร้าน</span>
          </button>
        )}

        {/* Sunmi V2 Terminal Display Launcher */}
        <button
          onClick={handleOpenSunmiDisplay}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F3FF] hover:bg-purple-100 border border-[#DDD6FE] text-[#7C3AED] text-xs font-bold shadow-2xs transition-all active:scale-95"
          title="เปิดหน้าจอสำหรับเครื่อง Sunmi V2 (Customer QR & Printer)"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>จอ Sunmi V2 🖨️</span>
        </button>

        {/* Open Customer Queue Screen Button */}
        <button
          onClick={handleOpenCustomerDisplay}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#CCFBF1] border border-[#E2E8F0] text-[#475569] hover:text-[#0D9488] text-xs font-bold shadow-2xs transition-all active:scale-95"
          title="เปิดหน้าต่างจอเรียกคิวลูกค้าหน้าร้านแยกออกมา"
        >
          <Tv className="w-3.5 h-3.5 text-[#475569]" />
          <span>จอเรียกลูกค้า 📺</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] shadow-xs transition-colors"
          title="รีเฟรชออเดอร์"
        >
          <RefreshCw className={clsx('w-4 h-4', isRefetching && 'animate-spin text-[#0D9488]')} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] shadow-xs transition-colors"
          title={isFullscreen ? 'ออกจากเต็มจอ' : 'แสดงเต็มจอ'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

