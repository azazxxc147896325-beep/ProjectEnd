'use client';

import React from 'react';
import { Sparkles, Bell, Wifi } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar({ title, description }: { title: string; description?: string }) {
  const { vendor } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Online Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>Real-time Live</span>
        </div>

        {/* Store Name Badge */}
        <div className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-brand-800 hidden sm:block">
          🏪 {vendor?.name || 'ร้านค้าของคุณ'}
        </div>
      </div>
    </header>
  );
}
