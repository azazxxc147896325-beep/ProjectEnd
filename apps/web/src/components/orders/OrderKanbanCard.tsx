import React from 'react';
import { Order, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@campus-food/shared-types';
import { OrderTypeBadge, PaymentBadge } from '../ui/Badge';
import { Clock, Check, CheckCircle2, BellRing, User, MessageSquare, XCircle, Banknote, Printer } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { printQueueSlip } from '@/lib/print-slip';
import { clsx } from 'clsx';

interface OrderKanbanCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus, cancelReason?: string) => Promise<void>;
  onPromptPrint?: (order: Order) => void;
  isLoading?: boolean;
}

export function OrderKanbanCard({ order, onUpdateStatus, onPromptPrint, isLoading }: OrderKanbanCardProps) {
  const [isActionPending, setIsActionPending] = React.useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = React.useState(false);

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

  const handleMarkCashPaid = async () => {
    try {
      setIsMarkingPaid(true);
      await apiClient(`/orders/${order.id}/mark-paid`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark cash as paid:', err);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const isCashPending = order.paymentMethod === PaymentMethod.CASH && order.paymentStatus === PaymentStatus.PENDING;

  return (
    <div className="bg-white rounded-2xl p-4 transition-all duration-200 border border-slate-200/90 hover:border-brand-400/50 shadow-xs hover:shadow-md space-y-3.5">
      {/* Top Header: Queue Number + Order Type + Payment Badge + Time */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="w-8 h-8 rounded-xl bg-sky-50 text-brand-700 border border-sky-200 flex items-center justify-center font-black text-sm shadow-xs">
            #{order.queueNumber}
          </span>
          <OrderTypeBadge type={order.orderType} />
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(order.createdAt)}</span>
          </div>

          <button
            onClick={() => printQueueSlip(order)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="พิมพ์ใบเลขคิว / สลิปแปะกล่องอาหาร"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{order.student?.fullName || 'นักศึกษา'}</span>
        </div>
        {order.student?.phone && (
          <span className="text-slate-400 text-[11px]">{order.student.phone}</span>
        )}
      </div>

      {/* Item List */}
      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-xs flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">
                {item.quantity}x {item.menuItem?.name || 'รายการอาหาร'}
              </span>
              {item.options && typeof item.options === 'object' && (
                <p className="text-[11px] text-brand-700 pl-4">
                  {Object.entries(item.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                </p>
              )}
            </div>
            <span className="text-slate-600 font-semibold shrink-0">฿{Number(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Note if any */}
      {order.note && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span className="italic">{order.note}</span>
        </div>
      )}

      {/* Price and Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-slate-500 font-medium">ยอดรวมทั้งสิ้น</p>
          <p className="text-base font-bold text-slate-900">฿{Number(order.totalPrice).toLocaleString()}</p>
        </div>

        {/* Action Buttons based on current column/status */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Quick Mark Cash as Paid Button */}
          {isCashPending && order.status !== OrderStatus.CANCELLED && (
            <button
              onClick={handleMarkCashPaid}
              disabled={isMarkingPaid}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold transition-all active:scale-95 shadow-xs"
              title="กดยืนยันเมื่อได้รับเงินสดที่หน้าร้านแล้ว"
            >
              <Banknote className="w-3.5 h-3.5 text-amber-700" />
              <span>{isMarkingPaid ? 'กำลังบันทึก...' : 'รับเงินสดแล้ว'}</span>
            </button>
          )}

          {order.status === OrderStatus.PENDING && (
            <>
              <button
                onClick={() => handleAction(OrderStatus.CANCELLED)}
                disabled={isActionPending || isLoading}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-medium transition-all"
                title="ปฏิเสธคำสั่งซื้อ"
              >
                <XCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAction(OrderStatus.ACCEPTED)}
                disabled={isActionPending || isLoading}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-sm shadow-brand-500/25 active:scale-95"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm shadow-emerald-600/30 active:scale-95 animate-pulse-subtle"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>เสร็จแล้ว (แจ้งเตือน)</span>
            </button>
          )}

          {order.status === OrderStatus.READY && (
            <button
              onClick={() => handleAction(OrderStatus.COMPLETED)}
              disabled={isActionPending || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-200 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ลูกค้ารับแล้ว</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
