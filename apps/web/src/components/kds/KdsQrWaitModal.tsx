'use client';

import React from 'react';
import { Order, OrderType } from '@campus-food/shared-types';
import {
  X,
  QrCode,
  CheckCircle2,
  Printer,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface KdsQrWaitModalProps {
  isOpen: boolean;
  order: Order | null;
  totalPrice: number;
  vendorName: string;
  onClose: () => void;
  onConfirmPaid: () => Promise<void>;
  isSubmitting?: boolean;
}

export function KdsQrWaitModal({
  isOpen,
  order,
  totalPrice,
  vendorName,
  onClose,
  onConfirmPaid,
  isSubmitting,
}: KdsQrWaitModalProps) {
  if (!isOpen || !order) return null;

  const qrPayload =
    order.promptpayQrPayload ||
    `00020101021229370016A000000677010111011300668123456785303764540${totalPrice.toFixed(
      2,
    )}5802TH6304`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrPayload,
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-scale-up text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#0D9488] text-white font-bold text-[11px] tracking-tight shadow-2xs">
              Thai QR Payment
            </span>
            <h3 className="font-bold text-[#0F172A] text-sm">สแกนจ่ายพร้อมเพย์</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Badge */}
        <div className="w-full p-2.5 rounded-2xl bg-[#CCFBF1] border border-[#99F6E4] flex items-center justify-center gap-2 text-[#0D9488] text-xs font-bold animate-pulse">
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>หน้าจอ Sunmi V2 กำลังแสดง QR ให้ลูกค้าสแกน...</span>
        </div>

        {/* Store & Queue & Total Amount */}
        <div className="space-y-0.5">
          <p className="text-xs text-[#475569] font-medium">{vendorName || 'ร้านค้า'}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-[#0D9488] tracking-tight">
              ฿{totalPrice.toLocaleString()}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0D9488] font-black text-xs border border-[#99F6E4]">
              คิว #{order.queueNumber}
            </span>
          </div>
        </div>

        {/* QR Code Mirror Display */}
        <div className="p-3 bg-white border-2 border-[#99F6E4] rounded-3xl shadow-xs relative group">
          <img
            src={qrImageUrl}
            alt="PromptPay QR Code"
            className="w-52 h-52 object-contain rounded-xl mx-auto"
          />
        </div>

        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] text-xs font-medium w-full">
          <Printer className="w-4 h-4 text-[#059669] shrink-0" />
          <span>กดยืนยันรับเงินเพื่อพิมพ์บัตรคิวให้ลูกค้า และส่งเข้าช่อง "รอรับออเดอร์"</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-3 rounded-2xl border border-[#E2E8F0] text-[#475569] font-bold text-xs hover:bg-[#F8FAFC] transition-colors shadow-2xs"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirmPaid}
            disabled={isSubmitting}
            className="flex-2 py-3.5 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันรับเงิน (เข้าช่องรอรับออเดอร์) 💵'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
