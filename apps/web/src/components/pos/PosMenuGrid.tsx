'use client';

import React, { useState, useMemo } from 'react';
import { MenuItem } from '@campus-food/shared-types';
import { PosMenuItemCard } from './PosMenuItemCard';
import { Search, UtensilsCrossed, X } from 'lucide-react';
import { clsx } from 'clsx';

interface PosMenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  getItemCartQuantity: (itemId: string) => number;
  onSelectItem: (item: MenuItem) => void;
}

export function PosMenuGrid({
  items,
  isLoading,
  getItemCartQuantity,
  onSelectItem,
}: PosMenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return item.isAvailable !== false;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0FDFA] p-3 lg:p-5 overflow-hidden">
      {/* Category Bar & Quick Search */}
      <div className="space-y-3 mb-3 shrink-0">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออาหาร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-2xl bg-white border border-[#E2E8F0] text-sm font-medium text-[#0F172A] focus:outline-hidden focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-[#94A3B8] hover:text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs',
              selectedCategory === 'all'
                ? 'bg-[#0D9488] text-white shadow-teal-500/20'
                : 'bg-white text-[#475569] hover:bg-[#F0FDFA] border border-[#E2E8F0]',
            )}
          >
            ทั้งหมด ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  'px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs',
                  selectedCategory === cat
                    ? 'bg-[#0D9488] text-white shadow-teal-500/20'
                    : 'bg-white text-[#475569] hover:bg-[#F0FDFA] border border-[#E2E8F0]',
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#94A3B8] gap-2">
            <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">กำลังโหลดรายการอาหาร...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-white/60 p-6 text-center">
            <UtensilsCrossed className="w-10 h-10 opacity-30 mb-2" />
            <p className="text-sm font-bold text-slate-600">ไม่พบรายการอาหาร</p>
            <p className="text-xs text-slate-400">ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <PosMenuItemCard
                key={item.id}
                item={item}
                cartQuantity={getItemCartQuantity(item.id)}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
