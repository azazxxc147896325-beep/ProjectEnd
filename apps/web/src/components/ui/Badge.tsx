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
    default: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
    success: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    info: 'bg-[#CCFBF1] text-[#0D9488] border-[#99F6E4]',
    danger: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
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

export function OrderSourceBadge({
  isWalkIn,
  size = 'sm',
}: {
  isWalkIn?: boolean;
  size?: 'sm' | 'md';
}) {
  return isWalkIn ? (
    <Badge variant="purple" size={size} className="gap-1 font-bold">
      <span>🏪 หน้าร้าน (POS)</span>
    </Badge>
  ) : (
    <Badge variant="info" size={size} className="gap-1 font-bold">
      <span>📱 สั่งออนไลน์</span>
    </Badge>
  );
}



