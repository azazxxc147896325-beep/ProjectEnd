import React from 'react';
import { clsx } from 'clsx';
import { OrderStatus, OrderType } from '@campus-food/shared-types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border shadow-sm',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
    [OrderStatus.PENDING]: { label: 'รอรับออเดอร์', variant: 'warning' },
    [OrderStatus.ACCEPTED]: { label: 'รับแล้ว (กำลังเตรียม)', variant: 'info' },
    [OrderStatus.COOKING]: { label: 'กำลังเตรียมอาหาร', variant: 'warning' },
    [OrderStatus.READY]: { label: 'พร้อมรับอาหาร 🎉', variant: 'success' },
    [OrderStatus.COMPLETED]: { label: 'เสร็จสิ้น', variant: 'default' },
    [OrderStatus.CANCELLED]: { label: 'ยกเลิก', variant: 'danger' },
  };

  const info = map[status] || { label: status, variant: 'default' };

  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function OrderTypeBadge({ type }: { type: OrderType }) {
  return type === OrderType.DINE_IN ? (
    <Badge variant="info" size="sm">
      🍽️ ทานที่ร้าน
    </Badge>
  ) : (
    <Badge variant="purple" size="sm">
      🛍️ สั่งกลับบ้าน
    </Badge>
  );
}

export function PaymentBadge({
  method,
  status,
  size = 'sm',
}: {
  method?: string;
  status?: string;
  size?: 'sm' | 'md';
}) {
  const isPaid = status === 'paid';
  const isPromptPay = method === 'promptpay';

  if (isPromptPay) {
    return isPaid ? (
      <Badge variant="success" size={size} className="gap-1">
        <span>📱 พร้อมเพย์</span>
        <span className="font-bold">(ชำระแล้ว)</span>
      </Badge>
    ) : (
      <Badge variant="warning" size={size} className="gap-1">
        <span>📱 พร้อมเพย์</span>
        <span className="font-bold">(รอโอน)</span>
      </Badge>
    );
  }

  return isPaid ? (
    <Badge variant="success" size={size} className="gap-1">
      <span>💵 เงินสด</span>
      <span className="font-bold">(ชำระแล้ว)</span>
    </Badge>
  ) : (
    <Badge variant="warning" size={size} className="gap-1">
      <span>💵 เงินสด</span>
      <span className="font-bold">(รอเก็บเงิน)</span>
    </Badge>
  );
}

