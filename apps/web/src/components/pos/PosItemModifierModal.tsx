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
  const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState<string>('');

  const QUICK_NOTE_OPTIONS = [
    'ไม่ใส่ผัก',
    'ไม่ใส่ผักชี/ต้นหอม',
    'ไม่ใส่กระเทียม',
    'ไม่ใส่ผงชูรส',
    'หวานน้อย',
    'ไม่หวาน',
    'แยกน้ำ/น้ำซุป',
    'น้ำมันน้อย',
    'กรอบๆ',
    'ขอน้ำปลาพริก',
    'ขอน้ำซุปเพิ่ม',
    'ขอช้อนส้อม',
  ];

  const handleToggleQuickNote = (note: string) => {
    setSelectedQuickNotes((prev) => {
      if (prev.includes(note)) {
        return prev.filter((n) => n !== note);
      } else {
        return [...prev, note];
      }
    });
  };

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

    const combinedNotes = [
      ...selectedQuickNotes,
      ...(customNote.trim() ? [customNote.trim()] : []),
    ].join(', ');

    onConfirm({
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      menuItem: item,
      quantity,
      options: Object.keys(options).length > 0 ? options : undefined,
      customNote: combinedNotes || undefined,
      unitPrice,
      subtotal,
    });

    // Reset
    setQuantity(1);
    setPortion('regular');
    setEggOption('none');
    setSpicyLevel('normal');
    setSelectedQuickNotes([]);
    setCustomNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="font-black text-[#0F172A] text-base lg:text-lg">{item.name}</h3>
            <p className="text-xs text-[#0D9488] font-bold">
              ราคาเริ่มต้น ฿{Number(item.price).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modifiers List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Portion: Regular vs Special */}
          <div>
            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">ขนาด</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPortion('regular')}
                className={clsx(
                  'p-2.5 rounded-xl text-xs font-bold border text-center transition-all',
                  portion === 'regular'
                    ? 'bg-[#CCFBF1] border-[#0D9488] text-[#0D9488] shadow-2xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F0FDFA]',
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
                    ? 'bg-[#CCFBF1] border-[#0D9488] text-[#0D9488] shadow-2xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F0FDFA]',
                )}
              >
                พิเศษ (+10฿)
              </button>
            </div>
          </div>

          {/* Egg Add-on */}
          <div>
            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">เพิ่มไข่</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEggOption('none')}
                className={clsx(
                  'p-2 rounded-xl text-xs font-bold border text-center transition-all',
                  eggOption === 'none'
                    ? 'bg-[#CCFBF1] border-[#0D9488] text-[#0D9488] shadow-2xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F0FDFA]',
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
                    ? 'bg-[#CCFBF1] border-[#0D9488] text-[#0D9488] shadow-2xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F0FDFA]',
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
                    ? 'bg-[#CCFBF1] border-[#0D9488] text-[#0D9488] shadow-2xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F0FDFA]',
                )}
              >
                ไข่เจียว (+10฿)
              </button>
            </div>
          </div>

          {/* Spicy Level */}
          <div>
            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">ระดับความเผ็ด</label>
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
                      ? 'bg-[#CCFBF1] border-[#0D9488] text-[#0D9488] shadow-2xs'
                      : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F0FDFA]',
                  )}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Select Special Notes Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#0F172A]">
                โน้ตพิเศษ (แตะเลือกได้ทันที)
              </label>
              {selectedQuickNotes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedQuickNotes([])}
                  className="text-[11px] text-[#DC2626] hover:text-red-700 font-bold"
                >
                  ล้างโน้ต
                </button>
              )}
            </div>

            {/* Quick Chips Grid */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTE_OPTIONS.map((note) => {
                const isSelected = selectedQuickNotes.includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleToggleQuickNote(note)}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1',
                      isSelected
                        ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100 hover:border-slate-300',
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{note}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional text input for rare unique requests */}
            <input
              type="text"
              placeholder="พิมพ์เพิ่มเติม (ถ้ามี)..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full mt-2 px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-brand-600"
            />
          </div>
        </div>

        {/* Quantity and Confirm Action */}
        <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center font-bold hover:bg-[#F0FDFA] active:scale-95 shadow-2xs"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-black text-sm text-[#0F172A]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center font-bold hover:bg-[#F0FDFA] active:scale-95 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-md shadow-teal-500/25 flex items-center justify-between active:scale-95 transition-all"
          >
            <span>เพิ่มลงบิล</span>
            <span className="font-black">฿{subtotal.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
