'use client';

import React, { useState } from 'react';
import { AiGenerateImageResponse } from '@campus-food/shared-types';
import { Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface AiImageGalleryProps {
  result: AiGenerateImageResponse;
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function AiImageGallery({
  result,
  selectedUrl,
  onSelectUrl,
  onRegenerate,
  isGenerating,
}: AiImageGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const variations = result.variations && result.variations.length > 0
    ? result.variations
    : [result.imageUrl];

  return (
    <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-brand-600" />
          <span>ผลลัพธ์ภาพอาหารที่ได้ (แตะเลือกรูปที่ต้องการ):</span>
        </span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" />
          <span>เจนใหม่อีกครั้ง</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {variations.map((url, idx) => {
          const isCurSelected = selectedUrl === url;
          const isLoaded = loadedImages[idx];

          return (
            <div
              key={idx}
              onClick={() => onSelectUrl(url)}
              className={clsx(
                'relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group aspect-video bg-slate-100 flex items-center justify-center',
                isCurSelected
                  ? 'border-brand-600 shadow-md shadow-brand-500/30 scale-[1.02] ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 opacity-90 hover:opacity-100',
              )}
            >
              {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 gap-1.5 z-0">
                  <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] text-slate-500 font-medium">
                    กำลังโหลด AI รูป #{idx + 1}...
                  </span>
                </div>
              )}
              <img
                src={url}
                alt={`AI Generated Dish ${idx + 1}`}
                loading="eager"
                onLoad={() => {
                  setLoadedImages((prev) => ({ ...prev, [idx]: true }));
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  const retrySeed = Math.floor(Math.random() * 899999) + 100000;
                  target.src = url.replace(/seed=\d+/, `seed=${retrySeed}`);
                }}
                className={clsx(
                  'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                )}
              />
              {isCurSelected && (
                <div className="absolute top-2 right-2 bg-brand-600 text-white rounded-full p-1 shadow-md z-10 animate-in zoom-in-75 duration-150">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
