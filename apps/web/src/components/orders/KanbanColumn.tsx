'use client';

import React from 'react';
import { Order, OrderStatus } from '@campus-food/shared-types';
import { OrderKanbanCard } from './OrderKanbanCard';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface KanbanColumnProps {
  title: string;
  count: number;
  icon: LucideIcon;
  iconBgClass: string;
  iconTextClass: string;
  badgeClass: string;
  borderClass: string;
  orders: Order[];
  isLoading: boolean;
  isStatusPending: boolean;
  emptyText: string;
  onUpdateStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => Promise<void>;
  onPromptPrint?: (order: Order) => void;
}

export function KanbanColumn({
  title,
  count,
  icon: Icon,
  iconBgClass,
  iconTextClass,
  badgeClass,
  borderClass,
  orders,
  isLoading,
  isStatusPending,
  emptyText,
  onUpdateStatus,
  onPromptPrint,
}: KanbanColumnProps) {
  return (
    <div
      className={clsx(
        'bg-slate-100/70 rounded-3xl p-4 border flex flex-col space-y-4 min-h-[500px] shadow-xs',
        borderClass,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className={clsx('w-7 h-7 rounded-xl flex items-center justify-center', iconBgClass, iconTextClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">{title}</h3>
        </div>
        <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs', badgeClass)}>
          {count}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดออเดอร์...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/50">
            {emptyText}
          </div>
        ) : (
          orders.map((order) => (
            <OrderKanbanCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              onPromptPrint={onPromptPrint}
              isLoading={isStatusPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
