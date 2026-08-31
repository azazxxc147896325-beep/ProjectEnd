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
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs', iconBgClass, iconTextClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-black text-slate-900">
        {value} {unit && <span className="text-sm font-normal text-slate-500">{unit}</span>}
      </h3>
      <span className={clsx('text-[11px] font-bold', subtitleTextClass)}>{subtitle}</span>
    </div>
  );
}
