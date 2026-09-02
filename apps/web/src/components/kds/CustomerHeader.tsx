'use client';

import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Store,
  Clock,
  ArrowLeft,
  Tv,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

interface CustomerHeaderProps {
  vendorName: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  isRefetching: boolean;
}

export function CustomerHeader({
  vendorName,
  soundEnabled,
  onToggleSound,
  onRefresh,
  isRefetching,
}: CustomerHeaderProps) {
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
          year: 'numeric',
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

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 lg:px-8 py-3.5 shrink-0 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Store Title & Live Indicator */}
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

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black text-[#0F172A] tracking-tight truncate max-w-[200px] lg:max-w-[360px]">
                {vendorName || 'ร้านค้า'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4]">
                <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                จอเรียกคิวหน้าร้าน
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium">
              ระบบแสดงผลหมายเลขคิวอาหารสำหรับลูกค้า (Real-time Live Queue)
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Digital Clock */}
      <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-[#475569]">
        <Clock className="w-4 h-4 text-[#0D9488]" />
        <span className="text-base font-black font-mono tracking-wider text-[#0F172A]">{timeStr}</span>
        <span className="text-xs text-[#94A3B8] font-semibold border-l border-[#E2E8F0] pl-2.5">{dateStr}</span>
      </div>

      {/* Right: Sound & Fullscreen controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          className={clsx(
            'px-3 py-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5',
            soundEnabled
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] shadow-xs'
              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]',
          )}
          title={soundEnabled ? 'เสียงเตือนเมื่ออาหารพร้อม: เปิดอยู่' : 'เสียงเตือนเมื่ออาหารพร้อม: ปิดอยู่'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#059669]" /> : <VolumeX className="w-4 h-4 text-[#94A3B8]" />}
          <span>{soundEnabled ? 'เปิดเสียงเตือน' : 'ปิดเสียง'}</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="p-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] shadow-xs transition-colors"
          title="รีเฟรชคิว"
        >
          <RefreshCw className={clsx('w-4 h-4', isRefetching && 'animate-spin text-[#0D9488]')} />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] shadow-xs transition-colors"
          title={isFullscreen ? 'ออกจากเต็มจอ' : 'แสดงเต็มจอ'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
