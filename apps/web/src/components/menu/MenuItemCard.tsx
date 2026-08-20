'use client';

import React from 'react';
import { MenuItem } from '@campus-food/shared-types';
import { Sparkles, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleSpecial: (id: string, isDailySpecial: boolean) => void;
  onToggleAvailable: (id: string, isAvailable: boolean) => void;
}

export function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleSpecial,
  onToggleAvailable,
}: MenuItemCardProps) {
  return (
    <div
      className={clsx(
        'glass-panel rounded-3xl overflow-hidden border-slate-800/90 transition-all flex flex-col justify-between shadow-md',
        !item.isAvailable && 'opacity-60 grayscale-[40%]',
      )}
    >
      {/* Image Banner */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        <img
          src={
            item.imageUrl ||
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500'
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-white/10">
            {item.category}
          </span>
          {item.isDailySpecial && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-[11px] font-bold text-slate-950 flex items-center gap-1 shadow-lg shadow-amber-500/30 animate-pulse-subtle">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>Special</span>
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h4 className="font-bold text-base text-white tracking-tight">{item.name}</h4>
          </div>
          <span className="text-lg font-black text-brand-400 bg-slate-950/80 px-2.5 py-1 rounded-xl backdrop-blur-md border border-brand-500/30">
            ฿{Number(item.price)}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
          {item.description || 'ไม่มีคำอธิบายเมนู'}
        </p>

        {/* Interactive Switch Controls */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          {/* Toggle Special */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>เมนูพิเศษประจำวัน</span>
            </span>
            <button
              onClick={() => onToggleSpecial(item.id, !item.isDailySpecial)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                item.isDailySpecial
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300',
              )}
            >
              {item.isDailySpecial ? 'เปิดใช้งาน' : 'ปิด'}
            </button>
          </div>

          {/* Toggle Available */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              {item.isAvailable ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>สถานะสินค้า</span>
            </span>
            <button
              onClick={() => onToggleAvailable(item.id, !item.isAvailable)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                item.isAvailable
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              )}
            >
              {item.isAvailable ? 'พร้อมขาย (มีของ)' : 'ของหมดชั่วคราว'}
            </button>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-brand-400" />
            <span>แก้ไข</span>
          </button>
          <button
            onClick={() => onDelete(item.id, item.name)}
            className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 transition-colors"
            title="ลบเมนู"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
