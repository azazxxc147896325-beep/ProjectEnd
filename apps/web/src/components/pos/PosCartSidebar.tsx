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
    <aside className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-sm">
      {/* Header & Order Type Toggle */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">รายการสั่งซื้อหน้าร้าน</h3>
          </div>

          {!isEmpty && (
            <button
              onClick={onClearCart}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 flex items-center gap-1 transition-colors"
              title="ล้างรายการทั้งหมด"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างบิล</span>
            </button>
          )}
        </div>

        {/* Dine In vs Takeaway Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => onSetOrderType(OrderType.DINE_IN)}
            className={clsx(
              'py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              orderType === OrderType.DINE_IN
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900',
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
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900',
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
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
            <ShoppingBag className="w-12 h-12 opacity-30 mb-2" />
            <p className="text-sm font-bold text-slate-600">ยังไม่มีรายการในบิล</p>
            <p className="text-xs text-slate-400 mt-0.5">แตะเลือกอาหารจากเมนูด้านซ้ายเพื่อเพิ่มลงบิล</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs lg:text-sm">
                    {item.menuItem.name}
                  </h4>
                  {item.options && (
                    <p className="text-[11px] text-brand-700 font-medium">
                      {Object.entries(item.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </p>
                  )}
                  {item.customNote && (
                    <p className="text-[11px] text-amber-800 italic">
                      โน้ต: {item.customNote}
                    </p>
                  )}
                </div>
                <span className="font-black text-slate-900 text-xs lg:text-sm shrink-0">
                  ฿{item.subtotal.toLocaleString()}
                </span>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-[11px] text-slate-500 font-medium">
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
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
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
      <div className="p-4 border-t border-slate-200 bg-white space-y-3 shrink-0">
        {/* Order Note Input */}
        <div className="relative">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="โน้ตเพิ่มเติมสำหรับทั้งบิล (ถ้ามี)..."
            value={orderNote}
            onChange={(e) => onSetOrderNote(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-brand-500"
          />
        </div>

        {/* Total Summary */}
        <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>จำนวนรายการทั้งหมด</span>
            <span>{totalCount} รายการ</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
            <span className="font-black text-slate-900 text-sm">ยอดชำระสุทธิ</span>
            <span className="font-black text-brand-600 text-xl">
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
            className="py-3.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs lg:text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Banknote className="w-4 h-4" />
            <span>รับเงินสด 💵</span>
          </button>

          {/* PromptPay Button */}
          <button
            type="button"
            onClick={onOpenPromptPayModal}
            disabled={isEmpty || isSubmitting}
            className="py-3.5 px-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs lg:text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>พร้อมเพย์ QR 📱</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
