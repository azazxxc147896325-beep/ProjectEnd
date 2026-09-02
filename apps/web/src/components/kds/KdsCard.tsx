import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, OrderType } from '@campus-food/shared-types';
import { OrderTypeBadge, PaymentBadge, OrderSourceBadge } from '../ui/Badge';
import { Clock, Check, CheckCircle2, BellRing, User, MessageSquare, XCircle, AlertTriangle, Printer, CheckCircle } from 'lucide-react';
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

  // Determine if this order was placed at counter (Walk-in / POS)
  const isWalkIn =
    order.note?.includes('[POS]') ||
    order.note?.includes('[หน้าร้าน]') ||
    order.studentId === 'walk-in' ||
    order.studentId === order.vendorId ||
    order.studentId === order.vendor?.ownerId;

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

        // For Online orders: Open print confirmation modal when order is READY (ทำอาหารเสร็จแล้ว)
        if (status === OrderStatus.READY && !isWalkIn) {
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
        {/* Top Header: Queue Number + Order Type + Source Badge + Payment Badge */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                'w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs tracking-tight',
                order.status === OrderStatus.READY
                  ? 'bg-[#ECFDF5] text-[#059669] border-2 border-[#A7F3D0]'
                  : 'bg-[#CCFBF1] text-[#0D9488] border-2 border-[#99F6E4]',
              )}
            >
              #{order.queueNumber}
            </span>
            <OrderSourceBadge isWalkIn={isWalkIn} />
            <OrderTypeBadge type={order.orderType} />
            <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border',
                isUrgent
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] animate-pulse'
                  : isWarning
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]',
              )}
            >
              {isUrgent ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
              )}
              <span>{elapsedMinutes === 0 ? 'เพิ่งสั่ง' : `${elapsedMinutes} นาทีที่แล้ว`}</span>
            </div>

            <button
              onClick={() => printQueueSlip(order, { isWalkIn })}
              className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#CCFBF1] border border-[#E2E8F0] text-[#475569] hover:text-[#0D9488] transition-colors shadow-2xs active:scale-95"
              title="พิมพ์ใบเลขคิวซ้ำ / สลิปแปะกล่องอาหาร"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Walk-in Printed Indicator */}
        {isWalkIn && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#ECFDF5] text-[#059669] text-[11px] font-bold border border-[#A7F3D0]">
            <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
            <span>พิมพ์บัตรคิวให้ลูกค้าหน้าร้านแล้ว (Sunmi V2)</span>
          </div>
        )}


        {/* Customer Info */}
        <div className="flex items-center justify-between text-xs text-[#475569] px-1">
          <div className="flex items-center gap-1.5 font-semibold truncate">
            <User className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span className="truncate text-[#0F172A]">{order.student?.fullName || 'นักศึกษา'}</span>
          </div>
          {order.student?.phone && (
            <span className="text-[#94A3B8] text-xs font-mono">{order.student.phone}</span>
          )}
        </div>

        {/* Items List - Large Font for Tablet reading */}
        <div className="space-y-2 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 text-sm">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white border border-[#E2E8F0] text-[#0D9488] font-black text-xs flex items-center justify-center shrink-0">
                    x{item.quantity}
                  </span>
                  <span className="font-bold text-[#0F172A] leading-snug">
                    {item.menuItem?.name || 'รายการอาหาร'}
                  </span>
                </div>
                {item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-[#0D9488] pl-8 font-medium">
                    {Object.entries(item.options)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </p>
                )}
              </div>
              <span className="text-[#475569] font-bold text-xs shrink-0">
                ฿{Number(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Special Instructions Note */}
        {order.note && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-medium">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
            <span className="leading-snug">
              <strong className="text-[#D97706]">โน้ต:</strong> {order.note}
            </span>
          </div>
        )}
      </div>

      {/* Touch-Friendly Large Action Button Row */}
      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] text-[#94A3B8] font-medium">ยอดรวม</span>
          <p className="text-base font-black text-[#0F172A]">
            ฿{Number(order.totalPrice).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {order.status === OrderStatus.PENDING && (
            <>
              <button
                onClick={() => handleAction(OrderStatus.CANCELLED)}
                disabled={isActionPending || isLoading}
                className="p-3 text-xs rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-rose-100 font-bold transition-all active:scale-95"
                title="ปฏิเสธคำสั่งซื้อ"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleAction(OrderStatus.ACCEPTED)}
                disabled={isActionPending || isLoading}
                className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold transition-all shadow-md shadow-teal-500/25 active:scale-95"
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
              className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95 animate-pulse-subtle"
            >
              <BellRing className="w-4 h-4" />
              <span>เสร็จแล้ว (เรียกคิว)</span>
            </button>
          )}

          {order.status === OrderStatus.READY && (
            <button
              onClick={() => handleAction(OrderStatus.COMPLETED)}
              disabled={isActionPending || isLoading}
              className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>ส่งมอบอาหารแล้ว</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
