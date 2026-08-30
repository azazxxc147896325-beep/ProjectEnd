'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '@campus-food/shared-types';
import { X, Sparkles, Image as ImageIcon, Utensils, Wand2, FileText } from 'lucide-react';
import { AiImageGeneratorModal } from './AiImageGeneratorModal';
import { clsx } from 'clsx';

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
  const [hasImage, setHasImage] = useState<boolean>(false);
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
      setHasImage(Boolean(initialData.imageUrl && initialData.imageUrl.trim() !== ''));
    } else {
      setFormData({
        name: '',
        category: 'อาหารจานเดียว',
        price: 50,
        description: '',
        imageUrl: '',
        isDailySpecial: false,
        isAvailable: true,
      });
      setHasImage(false);
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">รายละเอียดเมนู / ตัวเลือกตามสั่ง</label>
                <span className="text-[11px] text-slate-400">ระบุวัตถุดิบ/ตัวเลือกเสริมได้</span>
              </div>
              <textarea
                rows={2}
                placeholder="เช่น เลือกเนื้อสัตว์: หมูสับ, ไก่, หมูกรอบ (+10฿) | ตัวเลือก: ไข่ดาว (+10฿), ไข่เจียว (+10฿) | เลือกระดับความเผ็ดได้..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Image Mode Selector (ใส่รูป vs ไม่ใส่รูป) */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  เลือกรูปแบบเมนูอาหาร
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setHasImage(false);
                      setFormData((prev) => ({ ...prev, imageUrl: '' }));
                    }}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                      !hasImage
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ไม่ใส่รูป (อาหารตามสั่ง)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasImage(true)}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                      hasImage
                        ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/20'
                        : 'text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>ใส่รูปภาพเมนู</span>
                  </button>
                </div>
              </div>

              {hasImage ? (
                <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">ใส่ URL หรือสร้างรูปด้วย AI</label>
                    <button
                      type="button"
                      onClick={() => setIsAiImageModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>🪄 สร้างรูปด้วย AI</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {formData.imageUrl ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 group">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-rose-300 font-bold transition-opacity"
                        >
                          ลบรูป
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-dashed border-slate-700 shrink-0 flex items-center justify-center text-slate-500 text-lg">
                        🖼️
                      </div>
                    )}
                    <div className="flex-1 relative">
                      <input
                        type="url"
                        placeholder="วางลิงก์รูปภาพ หรือกดสร้างรูปด้วย AI..."
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-rose-400"
                        >
                          ล้าง
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5 text-emerald-300/80 text-[11px] animate-in fade-in duration-150">
                  <span className="text-xl">🍛</span>
                  <span>
                    โหมด <strong>ไม่ใส่รูปภาพ</strong> — เหมาะสำหรับอาหารตามสั่ง ระบบจะเน้นชื่อเมนู, ราคา และตัวเลือกรายละเอียดที่ระบุด้านบน
                  </span>
                </div>
              )}
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
          setHasImage(true);
          setFormData((prev) => ({ ...prev, imageUrl: newUrl }));
        }}
        defaultDishName={formData.name}
        defaultCategory={formData.category}
      />
    </>
  );
}

