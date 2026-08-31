'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface PosPromptPayModalProps {
  isOpen: boolean;
  totalPrice: number;
  vendorName: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function PosPromptPayModal({
  isOpen,
  totalPrice,
  vendorName,
  onClose,
  onConfirm,
  isSubmitting,
}: PosPromptPayModalProps) {
  if (!isOpen) return null;

  const qrPayload = `00020101021229370016A000000677010111011300668123456785303764540${totalPrice.toFixed(2)}5802TH6304`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-scale-up text-center">
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white font-black text-[10px]">
              Thai QR Payment
            </span>
            <h3 className="font-black text-slate-900 text-base">สแกนจ่ายพร้อมเพย์</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store & Price */}
        <div>
          <p className="text-xs text-slate-500 font-medium">{vendorName || 'ร้านค้า'}</p>
          <p className="text-3xl font-black text-brand-600 mt-1">
            ฿{totalPrice.toLocaleString()}
          </p>
        </div>

        {/* QR Code */}
        <div className="p-3 bg-white border-2 border-brand-200 rounded-2xl shadow-sm">
          <img
            src={qrImageUrl}
            alt="PromptPay QR Code"
            className="w-52 h-52 object-contain"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 w-full justify-center">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>สแกนผ่านแอปธนาคารได้ทุกแห่ง</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-2 py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังบันทึก...' : 'ลูกค้าชำระเงินแล้ว 📱'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
