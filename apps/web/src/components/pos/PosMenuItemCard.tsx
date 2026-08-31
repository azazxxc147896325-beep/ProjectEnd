'use client';

import React from 'react';
import { MenuItem } from '@campus-food/shared-types';
import { Sparkles, Plus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';

interface PosMenuItemCardProps {
  item: MenuItem;
  cartQuantity: number;
  onSelectItem: (item: MenuItem) => void;
}

export function PosMenuItemCard({
  item,
  cartQuantity,
  onSelectItem,
}: PosMenuItemCardProps) {
  const isSelected = cartQuantity > 0;

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      className={clsx(
        'group relative flex flex-col justify-between p-3 rounded-2xl border text-left transition-all duration-150 active:scale-95 bg-white shadow-2xs hover:shadow-md cursor-pointer select-none min-h-[140px]',
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-sky-50/30'
          : 'border-slate-200 hover:border-brand-300',
      )}
    >
      {/* Top section: Category / Special / Cart Badge */}
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {item.category || 'ทั่วไป'}
          </span>
          {item.isDailySpecial && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>พิเศษ</span>
            </span>
          )}
        </div>

        {isSelected && (
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shadow-xs animate-scale-up">
            {cartQuantity}
          </span>
        )}
      </div>

      {/* Image if available */}
      {item.imageUrl && (
        <div className="relative w-full h-20 my-1.5 rounded-xl overflow-hidden bg-slate-100">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            unoptimized
          />
        </div>
      )}

      {/* Bottom section: Name & Price */}
      <div className="w-full mt-1.5">
        <h4 className="font-black text-slate-900 text-xs lg:text-sm line-clamp-2 leading-tight">
          {item.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-brand-600 font-black text-sm lg:text-base">
            ฿{Number(item.price).toLocaleString()}
          </span>
          <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </button>
  );
}
