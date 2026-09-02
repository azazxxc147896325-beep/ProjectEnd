'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Navbar } from '@/components/dashboard/Navbar';
import { KanbanColumn, KanbanToolbar, PrintQueueModal } from '@/components/orders';
import { Order, OrderStatus, OrderType, WsEvents } from '@campus-food/shared-types';
import { Clock, Utensils, CheckCircle, Bell } from 'lucide-react';

export default function OrdersKanbanPage() {
  const { vendor } = useAuth();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [printPromptOrder, setPrintPromptOrder] = useState<Order | null>(null);

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
        return [...list, payload.order].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    };

    // Handle Order Status Updates
    const handleStatusUpdated = (payload: { order: Order }) => {
      console.log('⚡ Real-time Order Status Updated:', payload.order.id, payload.order.status);
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor.id], (old) => {
        const list = Array.isArray(old) ? old : [];
        return list
          .map((o) => (o.id === payload.order.id ? payload.order : o))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
        return list
          .map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  const rawSafeOrders = Array.isArray(orders) ? orders : [];
  const safeOrders = [...rawSafeOrders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

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
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 animate-spin" />
              <span>🔔 {newOrderAlert}</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/20">ใหม่ล่าสุด</span>
          </div>
        )}

        {/* Error Banner */}
        {statusError && (
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm font-medium flex items-center gap-2.5 shadow-xs">
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
            iconBgClass="bg-[#FFFBEB]"
            iconTextClass="text-[#D97706]"
            badgeClass="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
            borderClass="border-[#FDE68A]/80"
            orders={pendingOrders}
            isLoading={isLoading}
            isStatusPending={updateStatusMutation.isPending}
            emptyText="ยังไม่มีออเดอร์ใหม่ในขณะนี้"
            onUpdateStatus={handleUpdateStatus}
            onPromptPrint={setPrintPromptOrder}
          />

          {/* Column 2: กำลังเตรียมอาหาร (รับแล้ว) */}
          <KanbanColumn
            title="กำลังเตรียมอาหาร (รับแล้ว)"
            count={preparingOrders.length}
            icon={Utensils}
            iconBgClass="bg-[#CCFBF1]"
            iconTextClass="text-[#0D9488]"
            badgeClass="bg-[#CCFBF1] text-[#0D9488] border-[#99F6E4]"
            borderClass="border-[#99F6E4]/80"
            orders={preparingOrders}
            isLoading={isLoading}
            isStatusPending={updateStatusMutation.isPending}
            emptyText="ไม่มีออเดอร์ที่กำลังเตรียม"
            onUpdateStatus={handleUpdateStatus}
            onPromptPrint={setPrintPromptOrder}
          />

          {/* Column 3: พร้อมรับอาหาร / เสร็จแล้ว */}
          <KanbanColumn
            title="พร้อมรับอาหาร (เสร็จแล้ว)"
            count={readyOrders.length}
            icon={CheckCircle}
            iconBgClass="bg-emerald-100"
            iconTextClass="text-emerald-700"
            badgeClass="bg-emerald-100 text-emerald-800 border-emerald-200"
            borderClass="border-emerald-200/80"
            orders={readyOrders}
            isLoading={isLoading}
            isStatusPending={updateStatusMutation.isPending}
            emptyText="ไม่มีอาหารที่รอรับในขณะนี้"
            onUpdateStatus={handleUpdateStatus}
            onPromptPrint={setPrintPromptOrder}
          />
        </div>
      </div>

      {/* Confirmation Modal to Print Queue Slip */}
      <PrintQueueModal
        order={printPromptOrder}
        isOpen={!!printPromptOrder}
        onClose={() => setPrintPromptOrder(null)}
        vendorName={vendor?.name}
      />
    </div>
  );
}
