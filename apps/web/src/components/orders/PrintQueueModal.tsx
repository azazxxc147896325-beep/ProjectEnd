'use client';

import React, { useEffect } from 'react';
import { Order, OrderType } from '@campus-food/shared-types';
import { Printer, X, CheckCircle2, Utensils, Package } from 'lucide-react';
import { printQueueSlip } from '@/lib/print-slip';

interface PrintQueueModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
}

export function PrintQueueModal({
  order,
  isOpen,
  onClose,
  vendorName,
}: PrintQueueModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !order) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printQueueSlip(order, vendorName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shadow-xs">
              <Printer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">ยืนยันพิมพ์ใบเลขคิว</h3>
              <p className="text-xs text-slate-500 font-medium">
                ทำอาหารเสร็จแล้ว ต้องการพิมพ์สลิปติดกล่องอาหารเลยหรือไม่?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Preview Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-brand-600 text-white font-black text-base shadow-sm">
                คิว #{order.queueNumber}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                {order.orderType === OrderType.DINE_IN ? (
                  <>
                    <Utensils className="w-3.5 h-3.5 text-brand-600" />
                    <span>ทานที่ร้าน</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3.5 h-3.5 text-brand-600" />
                    <span>สั่งกลับบ้าน</span>
                  </>
                )}
              </span>
            </div>
            <span className="text-sm font-black text-brand-700">
              ฿{Number(order.totalPrice).toLocaleString()}
            </span>
          </div>

          {/* Customer & Items preview */}
          <div className="text-xs text-slate-600 border-t border-slate-200/70 pt-2.5 space-y-1">
            <div className="font-semibold text-slate-800">
              ลูกค้า: {order.student?.fullName || 'นักศึกษา'}{' '}
              {order.student?.phone ? `(${order.student.phone})` : ''}
            </div>
            <div className="text-slate-500 truncate">
              {order.items.map((i) => `${i.quantity}x ${i.menuItem?.name}`).join(', ')}
            </div>
            {order.note && (
              <div className="text-amber-800 bg-amber-50 px-2 py-1 rounded-lg text-[11px] font-medium border border-amber-200">
                โน้ต: {order.note}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all shadow-xs"
          >
            ไม่พิมพ์ / ข้าม
          </button>

          <button
            type="button"
            onClick={handlePrint}
            autoFocus
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบเลขคิว 🖨️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
