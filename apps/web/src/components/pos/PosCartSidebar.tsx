'use client';

import React from 'react';
import { PosCartItem } from './PosItemModifierModal';
import { OrderType } from '@campus-food/shared-types';
import {
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  Utensils,
  Package,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PosCartSidebarProps {
  cartItems: PosCartItem[];
  orderType: OrderType;
  orderNote: string;
  onSetOrderType: (type: OrderType) => void;
  onSetOrderNote: (note: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCashModal: () => void;
  onOpenPromptPayModal: () => void;
  isSubmitting?: boolean;
}

export function PosCartSidebar({
  cartItems,
  orderType,
  orderNote,
  onSetOrderType,
  onSetOrderNote,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCashModal,
  onOpenPromptPayModal,
  isSubmitting,
}: PosCartSidebarProps) {
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const isEmpty = cartItems.length === 0;

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-[#E2E8F0] flex flex-col h-full shrink-0 shadow-sm">
      {/* Header & Order Type Toggle */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-black text-[#0F172A] text-sm">รายการสั่งซื้อหน้าร้าน</h3>
          </div>

          {!isEmpty && (
            <button
              onClick={onClearCart}
              className="text-xs font-bold text-[#DC2626] hover:text-red-700 p-1.5 rounded-lg hover:bg-rose-50 flex items-center gap-1 transition-colors"
              title="ล้างรายการทั้งหมด"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างบิล</span>
            </button>
          )}
        </div>

        {/* Dine In vs Takeaway Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => onSetOrderType(OrderType.DINE_IN)}
            className={clsx(
              'py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              orderType === OrderType.DINE_IN
                ? 'bg-white text-[#0D9488] shadow-2xs border border-[#E2E8F0]'
                : 'text-[#475569] hover:text-[#0F172A]',
            )}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>ทานที่ร้าน</span>
          </button>

          <button
            type="button"
            onClick={() => onSetOrderType(OrderType.TAKEAWAY)}
            className={clsx(
              'py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              orderType === OrderType.TAKEAWAY
                ? 'bg-white text-[#0D9488] shadow-2xs border border-[#E2E8F0]'
                : 'text-[#475569] hover:text-[#0F172A]',
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>สั่งกลับบ้าน</span>
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] py-16 text-center">
            <ShoppingBag className="w-12 h-12 opacity-30 mb-2" />
            <p className="text-sm font-bold text-[#475569]">ยังไม่มีรายการในบิล</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">แตะเลือกอาหารจากเมนูด้านซ้ายเพื่อเพิ่มลงบิล</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-[#0F172A] text-xs lg:text-sm">
                    {item.menuItem.name}
                  </h4>
                  {item.options && (
                    <p className="text-[11px] text-[#0D9488] font-medium">
                      {Object.entries(item.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </p>
                  )}
                  {item.customNote && (
                    <p className="text-[11px] text-[#D97706] italic">
                      โน้ต: {item.customNote}
                    </p>
                  )}
                </div>
                <span className="font-black text-[#0F172A] text-xs lg:text-sm shrink-0">
                  ฿{item.subtotal.toLocaleString()}
                </span>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                <span className="text-[11px] text-[#475569] font-medium">
                  ฿{item.unitPrice} / ชิ้น
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.quantity === 1) {
                        onRemoveItem(item.id);
                      } else {
                        onUpdateQuantity(item.id, -1);
                      }
                    }}
                    className="w-6 h-6 rounded-lg bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-[#0F172A]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-rose-50 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Footer & Checkout Actions */}
      <div className="p-4 border-t border-[#E2E8F0] bg-white space-y-3 shrink-0">
        {/* Quick Note Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#475569]">
            <span>โน้ตบิล (แตะเลือกด่วน)</span>
            {orderNote && (
              <button
                type="button"
                onClick={() => onSetOrderNote('')}
                className="text-[#DC2626] hover:text-red-700 font-bold"
              >
                ล้าง
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {['ไม่ใส่ผัก', 'แยกน้ำ/ซุป', 'ขอน้ำปลาพริก', 'ขอช้อนส้อม', 'น้ำมันน้อย', 'ไม่ใส่ชูรส'].map(
              (quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    if (orderNote.includes(quick)) {
                      onSetOrderNote(
                        orderNote
                          .replace(quick, '')
                          .replace(/,\s*,/g, ',')
                          .replace(/^,\s*|,\s*$/g, '')
                          .trim(),
                      );
                    } else {
                      onSetOrderNote(orderNote ? `${orderNote}, ${quick}` : quick);
                    }
                  }}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95',
                    orderNote.includes(quick)
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-2xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100',
                  )}
                >
                  {quick}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Order Note Input */}
        <div className="relative">
          <MessageSquare className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="พิมพ์โน้ตเพิ่มเติมสำหรับทั้งบิล (ถ้ามี)..."
            value={orderNote}
            onChange={(e) => onSetOrderNote(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-brand-600"
          />
        </div>

        {/* Total Summary */}
        <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#475569] font-medium">
            <span>จำนวนรายการทั้งหมด</span>
            <span>{totalCount} รายการ</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
            <span className="font-black text-[#0F172A] text-sm">ยอดชำระสุทธิ</span>
            <span className="font-black text-[#0D9488] text-xl">
              ฿{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons: Cash vs PromptPay */}
        <div className="grid grid-cols-2 gap-2">
          {/* Cash Button */}
          <button
            type="button"
            onClick={onOpenCashModal}
            disabled={isEmpty || isSubmitting}
            className="py-3.5 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs lg:text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Banknote className="w-4 h-4" />
            <span>รับเงินสด 💵</span>
          </button>

          {/* PromptPay Button */}
          <button
            type="button"
            onClick={onOpenPromptPayModal}
            disabled={isEmpty || isSubmitting}
            className="py-3.5 px-3 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs lg:text-sm shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>พร้อมเพย์ QR 📱</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
