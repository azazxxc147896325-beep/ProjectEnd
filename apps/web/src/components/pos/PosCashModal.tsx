'use client';

import React, { useState, useEffect } from 'react';
import { X, Banknote, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface PosCashModalProps {
  isOpen: boolean;
  totalPrice: number;
  onClose: () => void;
  onConfirm: (receivedAmount: number, changeAmount: number) => void;
  isSubmitting?: boolean;
}

export function PosCashModal({
  isOpen,
  totalPrice,
  onClose,
  onConfirm,
  isSubmitting,
}: PosCashModalProps) {
  const [receivedAmount, setReceivedAmount] = useState<number>(totalPrice);

  useEffect(() => {
    if (isOpen) {
      setReceivedAmount(totalPrice);
    }
  }, [isOpen, totalPrice]);

  if (!isOpen) return null;

  const changeAmount = Math.max(0, receivedAmount - totalPrice);
  const isInsufficient = receivedAmount < totalPrice;

  const quickBanknotes = [totalPrice, 50, 100, 500, 1000].filter(
    (v, i, arr) => arr.indexOf(v) === i && v >= totalPrice,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#0F172A] text-lg">รับชำระด้วยเงินสด</h3>
              <p className="text-xs text-[#475569] font-medium">คำนวณเงินทอนอัตโนมัติ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Price Display */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] flex items-center justify-between">
          <span className="text-sm font-bold text-[#475569]">ยอดที่ต้องชำระ</span>
          <span className="text-2xl font-black text-[#0D9488]">
            ฿{totalPrice.toLocaleString()}
          </span>
        </div>

        {/* Quick Cash Buttons */}
        <div>
          <label className="text-xs font-bold text-[#0F172A] mb-2 block">
            เลือกธนบัตรด่วน
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setReceivedAmount(totalPrice)}
              className={clsx(
                'py-2 px-3 rounded-xl text-xs font-bold border transition-all',
                receivedAmount === totalPrice
                  ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                  : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]',
              )}
            >
              พอดี (฿{totalPrice})
            </button>
            {[50, 100, 500, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setReceivedAmount(val)}
                className={clsx(
                  'py-2 px-3 rounded-xl text-xs font-bold border transition-all',
                  receivedAmount === val
                    ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                    : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]',
                )}
              >
                ฿{val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Cash Input */}
        <div>
          <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">
            จำนวนเงินที่รับมา (บาท)
          </label>
          <input
            type="number"
            value={receivedAmount || ''}
            onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
            className="w-full text-xl font-black text-[#0F172A] px-4 py-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:outline-hidden focus:border-brand-600 focus:bg-white"
          />
        </div>

        {/* Change Amount Box */}
        <div
          className={clsx(
            'p-4 rounded-2xl border flex items-center justify-between transition-all',
            isInsufficient
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]',
          )}
        >
          <div className="flex items-center gap-2">
            {isInsufficient ? (
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
            )}
            <span className="text-sm font-bold">
              {isInsufficient ? 'ยอดเงินไม่เพียงพอ' : 'เงินทอน'}
            </span>
          </div>
          <span className="text-2xl font-black">
            {isInsufficient
              ? `ขาดอีก ฿${(totalPrice - receivedAmount).toLocaleString()}`
              : `฿${changeAmount.toLocaleString()}`}
          </span>
        </div>

        {/* Confirm Action Button */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-[#E2E8F0] text-[#475569] font-bold text-sm hover:bg-[#F8FAFC]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => onConfirm(receivedAmount, changeAmount)}
            disabled={isInsufficient || isSubmitting}
            className="flex-2 py-3 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-md shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Banknote className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันรับเงินสด 💵'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
