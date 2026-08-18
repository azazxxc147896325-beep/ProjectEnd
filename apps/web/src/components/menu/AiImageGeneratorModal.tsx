'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { AiFoodImageStyle, AiGenerateImageResponse } from '@campus-food/shared-types';
import {
  Sparkles,
  X,
  Wand2,
  Check,
  Camera,
  Flame,
  Coffee,
  Layers,
  Sparkle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

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
  const [dishName, setDishName] = useState(defaultDishName);
  const [category, setCategory] = useState(defaultCategory);
  const [style, setStyle] = useState<AiFoodImageStyle>('realistic_studio');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AiGenerateImageResponse | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  React.useEffect(() => {
    if (defaultDishName) setDishName(defaultDishName);
    if (defaultCategory) setCategory(defaultCategory);
  }, [defaultDishName, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const styleOptions: { id: AiFoodImageStyle; label: string; icon: any; desc: string }[] = [
    {
      id: 'realistic_studio',
      label: 'สตูดิโอ 4K คมชัด',
      icon: Camera,
      desc: 'จัดแสงระดับมืออาชีพ ชัดเจน สวยงามเหมือนถ่ายในสตูดิโอ',
    },
    {
      id: 'street_food',
      label: 'สตรีทฟู้ดร้อนๆ ควันฉุย',
      icon: Flame,
      desc: 'บรรยากาศร้านอาหารตามสั่ง ควันกรุ่น สีสันจัดจ้าน น่ารับประทาน',
    },
    {
      id: 'minimal_cafe',
      label: 'คาเฟ่มินิมอลคลีนๆ',
      icon: Coffee,
      desc: 'แสงธรรมชาตินุ่มละมุน สไตล์คาเฟ่ จานชามเซรามิกโมเดิร์น',
    },
    {
      id: 'overhead_flatlay',
      label: 'Top-down Flatlay',
      icon: Layers,
      desc: 'มุมมองถ่ายจากด้านบน พร้อมองค์ประกอบวัตถุดิบและสมุนไพรรอบจาน',
    },
    {
      id: 'cinematic_moody',
      label: 'Cinematic หรูหรา',
      icon: Sparkle,
      desc: 'แสงเงาสไตล์ Fine Dining โทนเข้ม พรีเมียมระดับมิชลิน',
    },
  ];

  const handleGenerate = async () => {
    if (!dishName.trim()) return;

    try {
      setIsGenerating(true);
      const data = await apiClient<AiGenerateImageResponse>('/ai/generate-menu-image', {
        method: 'POST',
        body: JSON.stringify({
          dishName,
          category,
          style,
          customPrompt,
        }),
      });

      setResult(data);
      setSelectedUrl(data.imageUrl);
    } catch (err) {
      console.error('Error generating AI image:', err);
      // Fallback generator URL
      const encoded = encodeURIComponent(`Delicious Thai food ${dishName}, food photography 4k`);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&model=flux&nologo=true`;
      setResult({
        imageUrl: fallbackUrl,
        promptUsed: dishName,
        variations: [fallbackUrl],
      });
      setSelectedUrl(fallbackUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border-slate-700/80 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <span>AI Menu Image Studio</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                    PRO
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  สร้างและเจนรูปภาพจานอาหารระดับ 4K สำหรับเมนูของคุณด้วย AI ในไม่กี่วินาที
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อเมนูอาหารที่ต้องการสร้างรูป *
                </label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวกะเพราหมูกรอบไข่ดาว"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  หมวดหมู่อาหาร
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="อาหารจานเดียว">อาหารจานเดียว</option>
                  <option value="ก๋วยเตี๋ยว">ก๋วยเตี๋ยว</option>
                  <option value="ของทานเล่น">ของทานเล่น</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ของหวาน">ของหวาน</option>
                </select>
              </div>
            </div>

            {/* AI Style Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                เลือกสไตล์และบรรยากาศภาพ (AI Style)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-2.5">
                {styleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = style === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStyle(opt.id)}
                      className={clsx(
                        'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5',
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 text-white shadow-md shadow-brand-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={clsx('w-4 h-4', isSelected ? 'text-brand-400' : 'text-slate-400')} />
                          <span className="text-xs font-bold text-white">{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Custom Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รายละเอียดเพิ่มเติม (ตัวเลือกเสริม)
              </label>
              <input
                type="text"
                placeholder="เช่น ไข่ดาวเยิ้มๆ, หมูกรอบหนาฉ่ำ, เสิร์ฟพร้อมน้ำซุปถ้วยเล็ก..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating || !dishName.trim()}
              onClick={handleGenerate}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI กำลังปรุงแต่งและสร้างรูปภาพ 4K...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างรูปภาพด้วย AI ทันที</span>
                </>
              )}
            </button>
          </div>

          {/* Result Preview Gallery */}
          {result && (
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-400" />
                  <span>ผลลัพธ์ภาพอาหารที่ได้ (แตะเลือกรูปที่ต้องการ):</span>
                </span>
                <span className="text-[11px] text-slate-400">เลือกแล้ว 1 รูป</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(result.variations || [result.imageUrl]).map((url, idx) => {
                  const isCurSelected = selectedUrl === url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedUrl(url)}
                      className={clsx(
                        'relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group aspect-video bg-slate-900',
                        isCurSelected
                          ? 'border-brand-500 shadow-lg shadow-brand-500/30 scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100',
                      )}
                    >
                      <img
                        src={url}
                        alt={`Variation ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isCurSelected && (
                        <div className="absolute top-2 right-2 bg-brand-500 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 mt-6 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
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
  );
}
