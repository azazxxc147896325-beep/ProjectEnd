'use client';

import React, { useState } from 'react';
import { MenuItem } from '@campus-food/shared-types';
import { X, Plus, Minus, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface PosCartItem {
  id: string; // unique item uuid
  menuItem: MenuItem;
  quantity: number;
  options?: Record<string, string>;
  customNote?: string;
  unitPrice: number;
  subtotal: number;
}

interface PosItemModifierModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cartItem: PosCartItem) => void;
}

export function PosItemModifierModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: PosItemModifierModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [portion, setPortion] = useState<'regular' | 'special'>('regular');
  const [eggOption, setEggOption] = useState<'none' | 'fried_egg' | 'omelet'>('none');
  const [spicyLevel, setSpicyLevel] = useState<string>('normal');
  const [customNote, setCustomNote] = useState<string>('');

  if (!isOpen || !item) return null;

  const basePrice = Number(item.price);
  const portionPrice = portion === 'special' ? 10 : 0;
  const eggPrice = eggOption === 'fried_egg' ? 10 : eggOption === 'omelet' ? 10 : 0;
  const unitPrice = basePrice + portionPrice + eggPrice;
  const subtotal = unitPrice * quantity;

  const handleAdd = () => {
    const options: Record<string, string> = {};
    if (portion === 'special') options['ขนาด'] = 'พิเศษ (+10฿)';
    if (eggOption === 'fried_egg') options['ไข่'] = 'ไข่ดาว (+10฿)';
    if (eggOption === 'omelet') options['ไข่'] = 'ไข่เจียว (+10฿)';
    if (spicyLevel !== 'normal') {
      const map: Record<string, string> = {
        none: 'ไม่เผ็ด',
        mild: 'เผ็ดน้อย',
        extra: 'เผ็ดมาก',
      };
      options['ความเผ็ด'] = map[spicyLevel] || spicyLevel;
    }

    onConfirm({
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      menuItem: item,
      quantity,
      options: Object.keys(options).length > 0 ? options : undefined,
      customNote: customNote.trim() || undefined,
      unitPrice,
      subtotal,
    });

    // Reset
    setQuantity(1);
    setPortion('regular');
    setEggOption('none');
    setSpicyLevel('normal');
    setCustomNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-base lg:text-lg">{item.name}</h3>
            <p className="text-xs text-brand-600 font-bold">
              ราคาเริ่มต้น ฿{Number(item.price).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modifiers List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Portion: Regular vs Special */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">ขนาด</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPortion('regular')}
                className={clsx(
                  'p-2.5 rounded-xl text-xs font-bold border text-center transition-all',
                  portion === 'regular'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                ธรรมดา (+0฿)
              </button>
              <button
                type="button"
                onClick={() => setPortion('special')}
                className={clsx(
                  'p-2.5 rounded-xl text-xs font-bold border text-center transition-all',
                  portion === 'special'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                พิเศษ (+10฿)
              </button>
            </div>
          </div>

          {/* Egg Add-on */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">เพิ่มไข่</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEggOption('none')}
                className={clsx(
                  'p-2 rounded-xl text-xs font-bold border text-center transition-all',
                  eggOption === 'none'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                ไม่เพิ่ม
              </button>
              <button
                type="button"
                onClick={() => setEggOption('fried_egg')}
                className={clsx(
                  'p-2 rounded-xl text-xs font-bold border text-center transition-all',
                  eggOption === 'fried_egg'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                ไข่ดาว (+10฿)
              </button>
              <button
                type="button"
                onClick={() => setEggOption('omelet')}
                className={clsx(
                  'p-2 rounded-xl text-xs font-bold border text-center transition-all',
                  eggOption === 'omelet'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                ไข่เจียว (+10฿)
              </button>
            </div>
          </div>

          {/* Spicy Level */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">ระดับความเผ็ด</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'none', label: 'ไม่เผ็ด' },
                { id: 'mild', label: 'เผ็ดน้อย' },
                { id: 'normal', label: 'เผ็ดปกติ' },
                { id: 'extra', label: 'เผ็ดมาก' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSpicyLevel(lvl.id)}
                  className={clsx(
                    'py-2 px-1 rounded-xl text-xs font-bold border text-center transition-all',
                    spicyLevel === lvl.id
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              โน้ตพิเศษเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น ไม่ใส่ผักชี, ขอช้อนส้อม..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-brand-500"
            />
          </div>
        </div>

        {/* Quantity and Confirm Action */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 active:scale-95 shadow-2xs"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-black text-sm text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 active:scale-95 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-between active:scale-95 transition-all"
          >
            <span>เพิ่มลงบิล</span>
            <span className="font-black">฿{subtotal.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
