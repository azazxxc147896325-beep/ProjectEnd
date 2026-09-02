'use client';

import React from 'react';
import { Search, Plus, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';

interface MenuToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAiStudio: () => void;
  onAddNewItem: () => void;
}

export function MenuToolbar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAiStudio,
  onAddNewItem,
}: MenuToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเมนู..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0] shadow-xs',
              )}
            >
              {cat === 'all' ? 'ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAiStudio}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#CCFBF1] hover:bg-teal-100 border border-[#99F6E4] text-[#0D9488] font-bold text-xs shadow-xs transition-all"
        >
          <Wand2 className="w-4 h-4 text-[#0D9488]" />
          <span>AI Image Studio</span>
        </button>

        {/* Add Menu Button */}
        <button
          onClick={onAddNewItem}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเมนูใหม่</span>
        </button>
      </div>
    </div>
  );
}
