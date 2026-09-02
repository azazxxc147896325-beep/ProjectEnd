'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  LayoutGrid,
  BarChart3,
  Store,
  LogOut,
  Power,
  Sparkles,
  ChefHat,
  Tv,
  Monitor,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { clsx } from 'clsx';

export function Sidebar() {
  const pathname = usePathname();
  const { vendor, updateVendorStatus, logout, user } = useAuth();
  const [isToggling, setIsToggling] = React.useState(false);

  const navItems = [
    {
      name: 'คิวออเดอร์',
      fullName: 'คิวออเดอร์ (Kanban)',
      href: '/dashboard/orders',
      icon: LayoutGrid,
    },
    {
      name: 'คิดเงิน POS',
      fullName: 'คิดเงินหน้าร้าน (POS)',
      href: '/pos',
      icon: Monitor,
    },
    {
      name: 'จอห้องครัว',
      fullName: 'จอห้องครัว (KDS)',
      href: '/kds',
      icon: ChefHat,
    },
    {
      name: 'จอ Sunmi',
      fullName: 'จอ Sunmi V2 🖨️',
      href: '/sunmi',
      icon: Monitor,
    },
    {
      name: 'จอลูกค้า',
      fullName: 'จอเรียกคิวลูกค้า',
      href: '/queue-display',
      icon: Tv,
    },
    {
      name: 'จัดการเมนู',
      fullName: 'จัดการเมนูอาหาร',
      href: '/dashboard/menu',
      icon: UtensilsCrossed,
    },
    {
      name: 'สถิติยอดขาย',
      fullName: 'สถิติและยอดขาย',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
  ];

  const handleToggleStore = async () => {
    if (!vendor || isToggling) return;
    try {
      setIsToggling(true);
      await updateVendorStatus(!vendor.isOpen);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      {/* Mobile Top Header (Small Screens Only) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-xs text-[#0F172A] truncate max-w-[140px]">
              {vendor?.name || 'Campus Food'}
            </h1>
            <p className="text-[10px] text-[#475569]">Web App</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle store */}
          <button
            onClick={handleToggleStore}
            disabled={isToggling}
            className={clsx(
              'px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all',
              vendor?.isOpen
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]',
            )}
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                vendor?.isOpen ? 'bg-[#059669] animate-pulse' : 'bg-[#DC2626]',
              )}
            />
            <span>{vendor?.isOpen ? 'เปิดร้าน' : 'ปิดร้าน'}</span>
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-slate-100 border border-[#E2E8F0] text-[#475569] hover:text-[#DC2626]"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Medium Screens and above) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E2E8F0] flex-col justify-between p-4 h-screen sticky top-0 shrink-0 shadow-xs">
        {/* Top Header */}
        <div>
          <div className="flex items-center gap-3 px-3 py-4 border-b border-[#E2E8F0] mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-[#0F172A] truncate">
                {vendor?.name || 'Vendor Dashboard'}
              </h1>
              <p className="text-xs text-[#475569] truncate">ระบบจัดการร้านอาหาร</p>
            </div>
          </div>

          {/* Store Open/Close Switch Banner */}
          <div className="mb-6 px-3 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full',
                    vendor?.isOpen ? 'bg-[#059669] animate-pulse' : 'bg-[#DC2626]',
                  )}
                />
                <span className="text-xs font-semibold text-[#0F172A]">
                  {vendor?.isOpen ? 'เปิดรับออเดอร์' : 'ปิดร้านชั่วคราว'}
                </span>
              </div>
              <button
                onClick={handleToggleStore}
                disabled={isToggling}
                className={clsx(
                  'px-2 py-1 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-all',
                  vendor?.isOpen
                    ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] hover:bg-emerald-100'
                    : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] hover:bg-rose-100',
                )}
                title="กดเพื่อสลับสถานะเปิด/ปิดร้าน"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{vendor?.isOpen ? 'เปิดอยู่' : 'ปิดอยู่'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-xs tracking-wide transition-all',
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F0FDFA]',
                  )}
                >
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-[#0D9488]' : 'text-[#94A3B8]')} />
                  <span>{item.fullName}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="border-t border-[#E2E8F0] pt-4 px-2 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center font-bold text-xs text-[#0D9488] border border-[#99F6E4]">
              {user?.fullName?.slice(0, 1) || 'V'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-[#0F172A] truncate">{user?.fullName}</p>
              <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#475569] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Small Screens Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] flex items-center justify-around py-2 px-3 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all',
                isActive
                  ? 'text-[#0D9488] font-bold scale-105'
                  : 'text-[#475569] hover:text-[#0F172A]',
              )}
            >
              <div
                className={clsx(
                  'p-1.5 rounded-xl',
                  isActive ? 'bg-[#CCFBF1] text-[#0D9488]' : 'bg-transparent text-[#94A3B8]',
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

