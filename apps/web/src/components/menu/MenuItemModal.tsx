'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '@campus-food/shared-types';
import { X, Sparkles, Image as ImageIcon, Utensils, Wand2 } from 'lucide-react';
import { AiImageGeneratorModal } from './AiImageGeneratorModal';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMenuItemDto | UpdateMenuItemDto) => Promise<void>;
  initialData?: MenuItem | null;
}

export function MenuItemModal({ isOpen, onClose, onSubmit, initialData }: MenuItemModalProps) {
  const [formData, setFormData] = useState<CreateMenuItemDto>({
    name: '',
    category: 'อาหารจานเดียว',
    price: 50,
    description: '',
    imageUrl: '',
    isDailySpecial: false,
    isAvailable: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        price: Number(initialData.price),
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        isDailySpecial: initialData.isDailySpecial,
        isAvailable: initialData.isAvailable,
      });
    } else {
      setFormData({
        name: '',
        category: 'อาหารจานเดียว',
        price: 50,
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
        isDailySpecial: false,
        isAvailable: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['อาหารจานเดียว', 'ก๋วยเตี๋ยว', 'ของทานเล่น', 'เครื่องดื่ม', 'ของหวาน'];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border-slate-700/80 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-lg text-white">
                {initialData ? 'แก้ไขรายการอาหาร' : 'เพิ่มเมนูอาหารใหม่'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อเมนูอาหาร *</label>
              <input
                type="text"
                required
                placeholder="เช่น ข้าวกะเพราหมูกรอบไข่ดาว"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">หมวดหมู่อาหาร *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">ราคา (บาท) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">คำอธิบายเมนู</label>
              <textarea
                rows={2}
                placeholder="รสชาติ วัตถุดิบเด่น หรือระดับความเผ็ด..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Image URL & AI Generator Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">รูปภาพประกอบ (URL)</label>
                <button
                  type="button"
                  onClick={() => setIsAiImageModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>🪄 สร้างรูปด้วย AI</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {formData.imageUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Special & Availability Toggles */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">เมนูแนะนำพิเศษประจำวัน</span>
                    <p className="text-[11px] text-slate-400">จะแสดงอยู่ด้านบนสุดพร้อมป้าย Special</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isDailySpecial}
                  onChange={(e) => setFormData({ ...formData, isDailySpecial: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-800 border-slate-700"
                />
              </label>

              <div className="border-t border-slate-800" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200">สถานะพร้อมขาย (มีของ)</span>
                  <p className="text-[11px] text-slate-400">ปลดเลือกหากวัตถุดิบหมดชั่วคราว</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-800 border-slate-700"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 shadow-md shadow-brand-500/25 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'เพิ่มเมนูอาหาร'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded AI Image Generator Modal */}
      <AiImageGeneratorModal
        isOpen={isAiImageModalOpen}
        onClose={() => setIsAiImageModalOpen(false)}
        onSelectImage={(newUrl) => {
          setFormData((prev) => ({ ...prev, imageUrl: newUrl }));
        }}
        defaultDishName={formData.name}
        defaultCategory={formData.category}
      />
    </>
  );
}

