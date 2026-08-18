'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Navbar } from '@/components/dashboard/Navbar';
import { OrderKanbanCard } from '@/components/orders/OrderKanbanCard';
import { Order, OrderStatus, OrderType, WsEvents } from '@campus-food/shared-types';
import {
  Clock,
  Flame,
  CheckCircle,
  Filter,
  RefreshCw,
  ShoppingBag,
  Bell,
  Volume2,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function OrdersKanbanPage() {
  const { vendor, token } = useAuth();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  // Fetch Vendor Orders
  const {
    data: orders = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Order[]>({
    queryKey: ['vendor-orders', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return [];
      return apiClient(`/orders/vendor/${vendor.id}`);
    },
    enabled: !!vendor?.id,
    refetchInterval: 15000, // Background polling safety net
  });

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!vendor?.id) return;
    const socket = getSocket();

    // Join Vendor Room
    socket.emit(WsEvents.JOIN_VENDOR_ROOM, { vendorId: vendor.id });

    // Handle New Incoming Orders
    const handleNewOrder = (payload: { order: Order }) => {
      console.log('⚡ Received Real-time New Order:', payload.order);
      setNewOrderAlert(`ออเดอร์ใหม่! คิว #${payload.order.queueNumber}`);
      setTimeout(() => setNewOrderAlert(null), 6000);

      // Update TanStack Query Cache instantly
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor.id], (old = []) => {
        const exists = old.some((o) => o.id === payload.order.id);
        if (exists) return old;
        return [payload.order, ...old];
      });
    };

    // Handle Order Status Updates
    const handleStatusUpdated = (payload: { order: Order }) => {
      console.log('⚡ Real-time Order Status Updated:', payload.order.id, payload.order.status);
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor.id], (old = []) => {
        return old.map((o) => (o.id === payload.order.id ? payload.order : o));
      });
    };

    socket.on(WsEvents.NEW_ORDER, handleNewOrder);
    socket.on(WsEvents.ORDER_STATUS_UPDATED, handleStatusUpdated);

    return () => {
      socket.emit(WsEvents.LEAVE_VENDOR_ROOM, { vendorId: vendor.id });
      socket.off(WsEvents.NEW_ORDER, handleNewOrder);
      socket.off(WsEvents.ORDER_STATUS_UPDATED, handleStatusUpdated);
    };
  }, [vendor?.id, queryClient]);

  // Inline error state for status update failures
  const [statusError, setStatusError] = useState<string | null>(null);

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      cancelReason,
    }: {
      orderId: string;
      status: OrderStatus;
      cancelReason?: string;
    }) => {
      return apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, cancelReason }),
      });
    },
    onSuccess: (updatedOrder: Order) => {
      setStatusError(null);
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor?.id], (old = []) => {
        return old.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      });
    },
    onError: (error: any) => {
      const message = error?.message || 'ไม่สามารถอัปเดตสถานะออเดอร์ได้ กรุณาลองอีกครั้ง';
      setStatusError(message);
      setTimeout(() => setStatusError(null), 5000);
    },
  });

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, cancelReason?: string) => {
    await updateStatusMutation.mutateAsync({ orderId, status, cancelReason });
  };


  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterType === 'dine_in') return o.orderType === OrderType.DINE_IN;
    if (filterType === 'takeaway') return o.orderType === OrderType.TAKEAWAY;
    return true;
  });

  // Categorize into 3 Kanban Columns
  const pendingOrders = filteredOrders.filter(
    (o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.ACCEPTED,
  );
  const cookingOrders = filteredOrders.filter((o) => o.status === OrderStatus.COOKING);
  const readyOrders = filteredOrders.filter((o) => o.status === OrderStatus.READY);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="คิวออเดอร์อาหาร (Kanban)"
        description="ติดตามและอัปเดตสถานะออเดอร์แบบ Real-time โดยไม่ต้องรีเฟรชหน้าจอ"
      />

      <div className="p-6 space-y-6 flex-1 flex flex-col">
        {/* Realtime Alert Banner */}
        {newOrderAlert && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 animate-spin" />
              <span>🔔 {newOrderAlert}</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/20">ใหม่ล่าสุด</span>
          </div>
        )}

        {/* Error Banner: แสดงเมื่ออัปเดตสถานะ fail */}
        {statusError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-sm font-medium flex items-center gap-2.5 shadow-lg">
            <span className="text-base">⚠️</span>
            <span>{statusError}</span>
          </div>
        )}

        {/* Toolbar: Filter & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                filterType === 'all'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              ทั้งหมด ({orders.filter((o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length})
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                filterType === 'dine_in'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              🍽️ ทานที่ร้าน
            </button>
            <button
              onClick={() => setFilterType('takeaway')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                filterType === 'takeaway'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              🛍️ กลับบ้าน
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', isRefetching && 'animate-spin text-brand-400')} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* 3-Column Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
          {/* Column 1: รอรับออเดอร์ */}
          <div className="bg-slate-950/60 rounded-3xl p-4 border border-amber-500/20 flex flex-col space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">รอรับออเดอร์ / คิวใหม่</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 text-xs font-bold">
                {pendingOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500 text-xs">กำลังโหลดออเดอร์...</div>
              ) : pendingOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  ยังไม่มีออเดอร์ใหม่ในขณะนี้
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    isLoading={updateStatusMutation.isPending}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: กำลังปรุง */}
          <div className="bg-slate-950/60 rounded-3xl p-4 border border-brand-500/20 flex flex-col space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-brand-400 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">กำลังปรุงอาหาร</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-500/30 text-xs font-bold">
                {cookingOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {cookingOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  ไม่มีรายการที่กำลังปรุง
                </div>
              ) : (
                cookingOrders.map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    isLoading={updateStatusMutation.isPending}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: พร้อมรับอาหาร */}
          <div className="bg-slate-950/60 rounded-3xl p-4 border border-emerald-500/20 flex flex-col space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">พร้อมรับอาหาร (รอนักศึกษามารับ)</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  ไม่มีออเดอร์ที่รอรับ
                </div>
              ) : (
                readyOrders.map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    isLoading={updateStatusMutation.isPending}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
