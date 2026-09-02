'use client';

import React from 'react';
import { Sparkles, Bell, Wifi } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar({ title, description }: { title: string; description?: string }) {
  const { vendor } = useAuth();

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A]">{title}</h2>
        {description && <p className="text-xs text-[#475569]">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Online Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold">
          <Wifi className="w-3 h-3 text-[#059669] animate-pulse" />
          <span>Real-time Live</span>
        </div>

        {/* Store Name Badge */}
        <div className="px-3 py-1 rounded-xl bg-[#CCFBF1] border border-[#99F6E4] text-xs font-bold text-[#0D9488] hidden sm:block shadow-2xs">
          🏪 {vendor?.name || 'ร้านค้าของคุณ'}
        </div>
      </div>
    </header>
  );
}
