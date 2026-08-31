import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, OrderType } from '@campus-food/shared-types';
import { OrderTypeBadge, PaymentBadge } from '../ui/Badge';
import { Clock, Check, CheckCircle2, BellRing, User, MessageSquare, XCircle, AlertTriangle, Printer } from 'lucide-react';
import { printQueueSlip } from '@/lib/print-slip';
import { clsx } from 'clsx';

interface KdsCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus, cancelReason?: string) => Promise<void>;
  onPromptPrint?: (order: Order) => void;
  isLoading?: boolean;
}

export function KdsCard({ order, onUpdateStatus, onPromptPrint, isLoading }: KdsCardProps) {
  const [isActionPending, setIsActionPending] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // Calculate elapsed time from order creation
  useEffect(() => {
    const calcElapsed = () => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      const mins = Math.max(0, Math.floor((now - created) / 60000));
      setElapsedMinutes(mins);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 30000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

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

        // Open print confirmation modal when order is READY (ทำอาหารเสร็จแล้ว)
        if (status === OrderStatus.READY) {
          if (onPromptPrint) {
            onPromptPrint(order);
          } else {
            printQueueSlip(order);
          }
        }
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const isUrgent = elapsedMinutes >= 15;
  const isWarning = elapsedMinutes >= 10 && elapsedMinutes < 15;

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl p-4 lg:p-5 transition-all duration-200 border shadow-xs hover:shadow-md flex flex-col justify-between gap-4',
        order.status === OrderStatus.READY
          ? 'border-emerald-300 ring-2 ring-emerald-500/20'
          : isUrgent
          ? 'border-rose-300 ring-2 ring-rose-500/20'
          : isWarning
          ? 'border-amber-300'
          : 'border-slate-200',
      )}
    >
      <div className="space-y-3.5">
        {/* Top Header: Queue Number + Order Type + Payment Badge + Elapsed Time Badge + Print Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                'w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs tracking-tight',
                order.status === OrderStatus.READY
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-sky-50 text-brand-700 border-2 border-sky-300',
              )}
            >
              #{order.queueNumber}
            </span>
            <OrderTypeBadge type={order.orderType} />
            <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border',
                isUrgent
                  ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600',
              )}
            >
              {isUrgent ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{elapsedMinutes === 0 ? 'เพิ่งสั่ง' : `${elapsedMinutes} นาทีที่แล้ว`}</span>
            </div>

            <button
              onClick={() => printQueueSlip(order)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs active:scale-95"
              title="พิมพ์ใบเลขคิว / สลิปแปะกล่องอาหาร"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center justify-between text-xs text-slate-700 px-1">
          <div className="flex items-center gap-1.5 font-semibold truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-800">{order.student?.fullName || 'นักศึกษา'}</span>
          </div>
          {order.student?.phone && (
            <span className="text-slate-400 text-xs font-mono">{order.student.phone}</span>
          )}
        </div>

        {/* Items List - Large Font for Tablet reading */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 text-sm">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-brand-700 font-black text-xs flex items-center justify-center shrink-0">
                    x{item.quantity}
                  </span>
                  <span className="font-bold text-slate-900 leading-snug">
                    {item.menuItem?.name || 'รายการอาหาร'}
                  </span>
                </div>
                {item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-brand-700 pl-8 font-medium">
                    {Object.entries(item.options)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </p>
                )}
              </div>
              <span className="text-slate-700 font-bold text-xs shrink-0">
                ฿{Number(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Special Instructions Note */}
        {order.note && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span className="leading-snug">
              <strong className="text-amber-800">โน้ต:</strong> {order.note}
            </span>
          </div>
        )}
      </div>

      {/* Touch-Friendly Large Action Button Row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] text-slate-500 font-medium">ยอดรวม</span>
          <p className="text-base font-black text-slate-900">
            ฿{Number(order.totalPrice).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {order.status === OrderStatus.PENDING && (
            <>
              <button
                onClick={() => handleAction(OrderStatus.CANCELLED)}
                disabled={isActionPending || isLoading}
                className="p-3 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold transition-all active:scale-95"
                title="ปฏิเสธคำสั่งซื้อ"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleAction(OrderStatus.ACCEPTED)}
                disabled={isActionPending || isLoading}
                className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-md shadow-brand-500/25 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>รับออเดอร์</span>
              </button>
            </>
          )}

          {(order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.COOKING) && (
            <button
              onClick={() => handleAction(OrderStatus.READY)}
              disabled={isActionPending || isLoading}
              className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95 animate-pulse-subtle"
            >
              <BellRing className="w-4 h-4" />
              <span>เสร็จแล้ว (เรียกคิว)</span>
            </button>
          )}

          {order.status === OrderStatus.READY && (
            <button
              onClick={() => handleAction(OrderStatus.COMPLETED)}
              disabled={isActionPending || isLoading}
              className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ส่งมอบอาหารแล้ว</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
