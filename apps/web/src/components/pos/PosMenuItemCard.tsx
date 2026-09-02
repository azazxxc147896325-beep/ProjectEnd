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
          ? 'border-[#0D9488] ring-2 ring-brand-500/20 bg-[#F0FDFA]'
          : 'border-[#E2E8F0] hover:border-[#99F6E4]',
      )}
    >
      {/* Top section: Category / Special / Cart Badge */}
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#475569]">
            {item.category || 'ทั่วไป'}
          </span>
          {item.isDailySpecial && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFFBEB] text-[#D97706] flex items-center gap-0.5 border border-[#FDE68A]">
              <Sparkles className="w-2.5 h-2.5" />
              <span>พิเศษ</span>
            </span>
          )}
        </div>

        {isSelected && (
          <span className="w-6 h-6 rounded-full bg-[#0D9488] text-white font-black text-xs flex items-center justify-center shadow-xs animate-scale-up">
            {cartQuantity}
          </span>
        )}
      </div>

      {/* Image if available */}
      {item.imageUrl && (
        <div className="relative w-full h-20 my-1.5 rounded-xl overflow-hidden bg-[#F8FAFC]">
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
        <h4 className="font-black text-[#0F172A] text-xs lg:text-sm line-clamp-2 leading-tight">
          {item.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[#0D9488] font-black text-sm lg:text-base">
            ฿{Number(item.price).toLocaleString()}
          </span>
          <div className="w-6 h-6 rounded-lg bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </button>
  );
}
