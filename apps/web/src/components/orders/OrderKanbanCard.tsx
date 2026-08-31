'use client';

import React from 'react';
import { Order, OrderStatus, OrderType } from '@campus-food/shared-types';
import { OrderTypeBadge } from '../ui/Badge';
import { Clock, Check, CheckCircle2, BellRing, User, MessageSquare, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface OrderKanbanCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus, cancelReason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function OrderKanbanCard({ order, onUpdateStatus, isLoading }: OrderKanbanCardProps) {
  const [isActionPending, setIsActionPending] = React.useState(false);

  const formatTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAction = async (status: OrderStatus) => {
    try {
      if (status === OrderStatus.CANCELLED) {
        const reason = window.prompt('ระบุเหตุผลการยกเลิกคำสั่งซื้อ (เช่น วัตถุดิบหมด, คิวยาว):', 'วัตถุดิบหมด');
        if (reason === null) return;
        setIsActionPending(true);
        await onUpdateStatus(order.id, status, reason.trim() || 'ร้านค้ายกเลิกคำสั่งซื้อ');
      } else {
        setIsActionPending(true);
        await onUpdateStatus(order.id, status);
      }
    } finally {
      setIsActionPending(false);
    }
  };


  return (
    <div className="glass-panel rounded-2xl p-4 transition-all duration-200 border-slate-800 hover:border-slate-700 shadow-md space-y-3.5">
      {/* Top Header: Queue Number + Order Type + Time */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/40 flex items-center justify-center font-black text-sm shadow-inner">
            #{order.queueNumber}
          </span>
          <OrderTypeBadge type={order.orderType} />
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatTime(order.createdAt)}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{order.student?.fullName || 'นักศึกษา'}</span>
        </div>
        {order.student?.phone && (
          <span className="text-slate-500 text-[11px]">{order.student.phone}</span>
        )}
      </div>

      {/* Item List */}
      <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-xs flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">
                {item.quantity}x {item.menuItem?.name || 'รายการอาหาร'}
              </span>
              {item.options && typeof item.options === 'object' && (
                <p className="text-[11px] text-brand-300/80 pl-4">
                  {Object.entries(item.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                </p>
              )}
            </div>
            <span className="text-slate-400 font-medium shrink-0">฿{Number(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Note if any */}
      {order.note && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span className="italic">{order.note}</span>
        </div>
      )}

      {/* Price and Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">ยอดรวมทั้งสิ้น</p>
          <p className="text-base font-bold text-white">฿{Number(order.totalPrice).toLocaleString()}</p>
        </div>

        {/* Action Buttons based on current column/status */}
        <div className="flex items-center gap-1.5">
          {order.status === OrderStatus.PENDING && (
            <>
              <button
                onClick={() => handleAction(OrderStatus.CANCELLED)}
                disabled={isActionPending || isLoading}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 font-medium transition-all"
                title="ปฏิเสธคำสั่งซื้อ"
              >
                <XCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAction(OrderStatus.ACCEPTED)}
                disabled={isActionPending || isLoading}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-md shadow-brand-500/25 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>รับออเดอร์</span>
              </button>
            </>
          )}

          {(order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.COOKING) && (
            <button
              onClick={() => handleAction(OrderStatus.READY)}
              disabled={isActionPending || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95 animate-pulse-subtle"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>เสร็จแล้ว (แจ้งเตือน)</span>
            </button>
          )}

          {order.status === OrderStatus.READY && (
            <button
              onClick={() => handleAction(OrderStatus.COMPLETED)}
              disabled={isActionPending || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold transition-all border border-slate-600 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ลูกค้ารับแล้ว</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
