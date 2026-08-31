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
    default: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    info: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
    danger: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
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
