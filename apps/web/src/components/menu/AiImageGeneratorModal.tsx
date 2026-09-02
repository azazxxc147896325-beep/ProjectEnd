'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { AiGenerateImageResponse } from '@campus-food/shared-types';
import { Sparkles, X, Wand2, Check } from 'lucide-react';
import { AiImageGallery } from './AiImageGallery';

import { useToast } from '@/lib/toast-context';

interface AiImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  defaultDishName?: string;
  defaultCategory?: string;
}

export function AiImageGeneratorModal({
  isOpen,
  onClose,
  onSelectImage,
  defaultDishName = '',
  defaultCategory = 'อาหารจานเดียว',
}: AiImageGeneratorModalProps) {
  const { success } = useToast();
  const [dishName, setDishName] = useState(defaultDishName);
  const [category, setCategory] = useState(defaultCategory);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AiGenerateImageResponse | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  useEffect(() => {
    if (defaultDishName) setDishName(defaultDishName);
    if (defaultCategory) setCategory(defaultCategory);
  }, [defaultDishName, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!dishName.trim()) return;

    try {
      setIsGenerating(true);
      const data = await apiClient<AiGenerateImageResponse>('/ai/generate-menu-image', {
        method: 'POST',
        body: JSON.stringify({
          dishName,
          category,
          style: 'realistic_studio',
          customPrompt,
        }),
      });

      setResult(data);
      setSelectedUrl(data.imageUrl);
      success('สร้างรูปภาพสำเร็จ! 🎨', `NanoBanana AI สร้างรูป "${dishName}" พร้อมให้เลือกใช้งาน`);
    } catch (err) {
      console.error('Error generating AI image:', err);
      // Generate AI diffusion images with prompt
      const promptCombined = encodeURIComponent(
        `Delicious appetizing ${dishName} ${customPrompt}, 8k food photography studio, gourmet plating`,
      );
      const s1 = Math.floor(Math.random() * 899999) + 100000;
      const s2 = Math.floor(Math.random() * 899999) + 100000;
      const s3 = Math.floor(Math.random() * 899999) + 100000;
      const fallbackUrl1 = `https://image.pollinations.ai/prompt/${promptCombined}?width=800&height=600&seed=${s1}&model=flux&nologo=true`;
      const fallbackUrl2 = `https://image.pollinations.ai/prompt/${promptCombined}?width=800&height=600&seed=${s2}&model=flux&nologo=true`;
      const fallbackUrl3 = `https://image.pollinations.ai/prompt/${promptCombined}?width=800&height=600&seed=${s3}&model=flux&nologo=true`;
      setResult({
        imageUrl: fallbackUrl1,
        promptUsed: `${dishName} ${customPrompt}`,
        variations: [fallbackUrl1, fallbackUrl2, fallbackUrl3],
      });
      setSelectedUrl(fallbackUrl1);
      success('สร้างรูปภาพสำเร็จ! 🎨', `สร้างตัวเลือกรูปภาพสำหรับ "${dishName}" เรียบร้อยแล้ว`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      success('เลือกรูปภาพสำเร็จ! 🖼️', 'นำรูปภาพไปใส่ในเมนูอาหารเรียบร้อยแล้ว');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#0F172A] flex items-center gap-2">
                  <span>AI Menu Image Studio</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-[10px] font-bold">
                    NanoBanana
                  </span>
                </h3>
                <p className="text-xs text-[#475569]">
                  สร้างและเจนรูปภาพจานอาหารด้วย NanoBanana AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#475569] hover:text-[#0F172A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  ชื่อเมนูอาหารที่ต้องการสร้างรูป *
                </label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวกะเพราหมูกรอบไข่ดาว"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  หมวดหมู่อาหาร
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="อาหารจานเดียว">อาหารจานเดียว</option>
                  <option value="ก๋วยเตี๋ยว">ก๋วยเตี๋ยว</option>
                  <option value="ของทานเล่น">ของทานเล่น</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ของหวาน">ของหวาน</option>
                </select>
              </div>
            </div>

            {/* Additional Custom Details */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                รายละเอียดเพิ่มเติม (ตัวเลือกเสริม)
              </label>
              <input
                type="text"
                placeholder="เช่น ไข่ดาวเยิ้มๆ, หมูกรอบหนาฉ่ำ, โรยผักชี..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating || !dishName.trim()}
              onClick={handleGenerate}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/25 active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI กำลังปรุงแต่งและสร้างรูปภาพ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างรูปภาพด้วย AI ทันที</span>
                </>
              )}
            </button>
          </div>

          {/* Result Preview Gallery Subcomponent */}
          {result && (
            <AiImageGallery
              result={result}
              selectedUrl={selectedUrl}
              onSelectUrl={setSelectedUrl}
              onRegenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            {selectedUrl ? '✓ เลือกรูปภาพแล้ว พร้อมนำไปใช้' : 'กรุณาแตะเลือกรูปภาพที่ชอบ 1 รูป'}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              ปิด
            </button>

            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>นำรูปนี้ไปใช้กับเมนู</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
