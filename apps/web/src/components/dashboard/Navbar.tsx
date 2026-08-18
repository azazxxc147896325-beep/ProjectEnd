'use client';

import React from 'react';
import { Sparkles, Bell, Wifi } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar({ title, description }: { title: string; description?: string }) {
  const { vendor } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Online Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Real-time Live</span>
        </div>

        {/* Store Name Badge */}
        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hidden sm:block">
          🏪 {vendor?.name || 'ร้านค้าของคุณ'}
        </div>
      </div>
    </header>
  );
}
