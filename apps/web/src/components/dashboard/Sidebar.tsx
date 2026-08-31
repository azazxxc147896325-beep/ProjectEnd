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
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-xs text-slate-800 truncate max-w-[140px]">
              {vendor?.name || 'Campus Food'}
            </h1>
            <p className="text-[10px] text-slate-500">Web App</p>
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
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700',
            )}
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                vendor?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500',
              )}
            />
            <span>{vendor?.isOpen ? 'เปิดร้าน' : 'ปิดร้าน'}</span>
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-rose-600"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Medium Screens and above) */}
      <aside className="hidden md:flex w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 flex-col justify-between p-4 h-screen sticky top-0 shrink-0 shadow-sm">
        {/* Top Header */}
        <div>
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-slate-800 truncate">
                {vendor?.name || 'Vendor Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 truncate">ระบบจัดการร้านอาหาร</p>
            </div>
          </div>

          {/* Store Open/Close Switch Banner */}
          <div className="mb-6 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full',
                    vendor?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500',
                  )}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {vendor?.isOpen ? 'เปิดรับออเดอร์' : 'ปิดร้านชั่วคราว'}
                </span>
              </div>
              <button
                onClick={handleToggleStore}
                disabled={isToggling}
                className={clsx(
                  'px-2 py-1 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-all',
                  vendor?.isOpen
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100',
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
                      ? 'bg-sky-50 text-brand-600 border border-sky-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                  )}
                >
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
                  <span>{item.fullName}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="border-t border-slate-100 pt-4 px-2 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center font-bold text-xs text-brand-700 border border-sky-200">
              {user?.fullName?.slice(0, 1) || 'V'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Small Screens Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around py-2 px-3 shadow-lg">
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
                  ? 'text-brand-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800',
              )}
            >
              <div
                className={clsx(
                  'p-1.5 rounded-xl',
                  isActive ? 'bg-sky-100 text-brand-600' : 'bg-transparent',
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

