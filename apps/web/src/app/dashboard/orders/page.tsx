'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Navbar } from '@/components/dashboard/Navbar';
import { KanbanColumn, KanbanToolbar } from '@/components/orders';
import { Order, OrderStatus, OrderType, WsEvents } from '@campus-food/shared-types';
import { Clock, Utensils, CheckCircle, Bell } from 'lucide-react';

export default function OrdersKanbanPage() {
  const { vendor } = useAuth();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Fetch Vendor Orders
  const {
    data: rawOrders = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Order[]>({
    queryKey: ['vendor-orders', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const res = await apiClient<any>(`/orders/vendor/${vendor.id}`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!vendor?.id,
    refetchInterval: 15000,
  });

  const orders = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any)?.data || [];

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
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor.id], (old) => {
        const list = Array.isArray(old) ? old : [];
        const exists = list.some((o) => o.id === payload.order.id);
        if (exists) return list;
        return [payload.order, ...list];
      });
    };

    // Handle Order Status Updates
    const handleStatusUpdated = (payload: { order: Order }) => {
      console.log('⚡ Real-time Order Status Updated:', payload.order.id, payload.order.status);
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor.id], (old) => {
        const list = Array.isArray(old) ? old : [];
        return list.map((o) => (o.id === payload.order.id ? payload.order : o));
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
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor?.id], (old) => {
        const list = Array.isArray(old) ? old : [];
        return list.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
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

  const safeOrders = Array.isArray(orders) ? orders : [];

  // Filter orders
  const filteredOrders = safeOrders.filter((o) => {
    if (!o) return false;
    if (filterType === 'dine_in') return o.orderType === OrderType.DINE_IN;
    if (filterType === 'takeaway') return o.orderType === OrderType.TAKEAWAY;
    return true;
  });

  // Categorize into 3 Kanban Columns (รอรับออเดอร์ -> กำลังเตรียม -> พร้อมรับอาหาร)
  const pendingOrders = filteredOrders.filter(
    (o) => o && o.status === OrderStatus.PENDING,
  );
  const preparingOrders = filteredOrders.filter(
    (o) =>
      o &&
      (o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.COOKING),
  );
  const readyOrders = filteredOrders.filter((o) => o && o.status === OrderStatus.READY);
  const activeOrderCount = safeOrders.filter(
    (o) => o && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED,
  ).length;

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

        {/* Error Banner */}
        {statusError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-sm font-medium flex items-center gap-2.5 shadow-lg">
            <span className="text-base">⚠️</span>
            <span>{statusError}</span>
          </div>
        )}

        {/* Toolbar: Filter & Refresh */}
        <KanbanToolbar
          filterType={filterType}
          onFilterChange={setFilterType}
          activeOrderCount={activeOrderCount}
          onRefresh={() => refetch()}
          isRefetching={isRefetching}
        />

        {/* 3-Column Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
          {/* Column 1: รอรับออเดอร์ */}
          <KanbanColumn
            title="รอรับออเดอร์ (คิวใหม่)"
            count={pendingOrders.length}
            icon={Clock}
            iconBgClass="bg-amber-500/20"
            iconTextClass="text-amber-400"
            badgeClass="bg-amber-950 text-amber-300 border-amber-500/30"
            borderClass="border-amber-500/20"
            orders={pendingOrders}
            isLoading={isLoading}
            isStatusPending={updateStatusMutation.isPending}
            emptyText="ยังไม่มีออเดอร์ใหม่ในขณะนี้"
            onUpdateStatus={handleUpdateStatus}
          />

          {/* Column 2: กำลังเตรียมอาหาร (รับแล้ว) */}
          <KanbanColumn
            title="กำลังเตรียมอาหาร (รับแล้ว)"
            count={preparingOrders.length}
            icon={Utensils}
            iconBgClass="bg-brand-500/20"
            iconTextClass="text-brand-400"
            badgeClass="bg-brand-950 text-brand-300 border-brand-500/30"
            borderClass="border-brand-500/20"
            orders={preparingOrders}
            isLoading={isLoading}
            isStatusPending={updateStatusMutation.isPending}
            emptyText="ไม่มีออเดอร์ที่กำลังเตรียม"
            onUpdateStatus={handleUpdateStatus}
          />

          {/* Column 3: พร้อมรับอาหาร / เสร็จแล้ว */}
          <KanbanColumn
            title="พร้อมรับอาหาร (เสร็จแล้ว)"
            count={readyOrders.length}
            icon={CheckCircle}
            iconBgClass="bg-emerald-500/20"
            iconTextClass="text-emerald-400"
            badgeClass="bg-emerald-950 text-emerald-300 border-emerald-500/30"
            borderClass="border-emerald-500/20"
            orders={readyOrders}
            isLoading={isLoading}
            isStatusPending={updateStatusMutation.isPending}
            emptyText="ไม่มีอาหารที่รอรับในขณะนี้"
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      </div>
    </div>
  );
}
