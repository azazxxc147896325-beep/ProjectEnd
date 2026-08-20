'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconTextClass: string;
  subtitleTextClass: string;
}

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconTextClass,
  subtitleTextClass,
}: KpiCardProps) {
  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-2 relative overflow-hidden shadow-md">
      <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center', iconBgClass, iconTextClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-400 font-medium">{title}</p>
      <h3 className="text-2xl font-black text-white">
        {value} {unit && <span className="text-sm font-normal text-slate-400">{unit}</span>}
      </h3>
      <span className={clsx('text-[11px] font-semibold', subtitleTextClass)}>{subtitle}</span>
    </div>
  );
}
