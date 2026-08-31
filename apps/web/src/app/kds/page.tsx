'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { KdsHeader, KdsCard } from '@/components/kds';
import { PrintQueueModal } from '@/components/orders';
import { Order, OrderStatus, OrderType, WsEvents } from '@campus-food/shared-types';
import { Clock, Utensils, CheckCircle, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function KdsPage() {
  const { vendor, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<string>('all');
  const [newOrderBanner, setNewOrderBanner] = useState<string | null>(null);
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
    refetchInterval: 12000,
  });

  const orders = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any)?.data || [];

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!vendor?.id) return;
    const socket = getSocket();

    socket.emit(WsEvents.JOIN_VENDOR_ROOM, { vendorId: vendor.id });

    const handleNewOrder = (payload: { order: Order }) => {
      console.log('⚡ [KDS] Real-time New Order:', payload.order);

      setNewOrderBanner(`🔔 ออเดอร์ใหม่! คิว #${payload.order.queueNumber} (${payload.order.items.length} รายการ)`);
      setTimeout(() => setNewOrderBanner(null), 7000);

      // Update Query Cache
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor.id], (old) => {
        const list = Array.isArray(old) ? old : [];
        const exists = list.some((o) => o.id === payload.order.id);
        if (exists) return list;
        return [...list, payload.order].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    };

    const handleStatusUpdated = (payload: { order: Order }) => {
      console.log('⚡ [KDS] Real-time Status Updated:', payload.order.id, payload.order.status);

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
      queryClient.setQueryData<Order[]>(['vendor-orders', vendor?.id], (old) => {
        const list = Array.isArray(old) ? old : [];
        return list
          .map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    },
  });

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, cancelReason?: string) => {
    await updateStatusMutation.mutateAsync({ orderId, status, cancelReason });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-700">กำลังเข้าสู่ระบบจอคิวห้องครัว KDS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !vendor) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">จอห้องครัว KDS (Kitchen Display)</h2>
          <p className="text-sm text-slate-500">
            ระบบจอแสดงผลคิวสำหรับ iPad และแท็บเล็ตในครัว จำเป็นต้องเข้าสู่ระบบบัญชีร้านค้าก่อนใช้งาน
          </p>
          <Link
            href="/login?redirect=/kds"
            className="block w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all text-center"
          >
            เข้าสู่ระบบร้านค้า
          </Link>
        </div>
      </div>
    );
  }

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

  const pendingOrders = filteredOrders.filter((o) => o && o.status === OrderStatus.PENDING);
  const preparingOrders = filteredOrders.filter(
    (o) => o && (o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.COOKING),
  );
  const readyOrders = filteredOrders.filter((o) => o && o.status === OrderStatus.READY);

  const totalActiveCount = safeOrders.filter(
    (o) => o && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED,
  ).length;

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col selection:bg-brand-500 selection:text-white">
      {/* KDS Header Bar without sound controls */}
      <KdsHeader
        vendorName={vendor.name}
        onRefresh={() => refetch()}
        isRefetching={isRefetching}
        totalActiveCount={totalActiveCount}
      />

      {/* Realtime Alert Banner */}
      {newOrderBanner && (
        <div className="mx-4 lg:mx-6 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-500 to-brand-600 text-white font-black text-sm shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 animate-spin" />
            <span>{newOrderBanner}</span>
          </div>
          <button
            onClick={() => setNewOrderBanner(null)}
            className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 font-bold transition-all"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Kitchen KDS Columns */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4">
        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterType === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              ทั้งหมด ({totalActiveCount})
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterType === 'dine_in'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              🍽️ ทานที่ร้าน
            </button>
            <button
              onClick={() => setFilterType('takeaway')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterType === 'takeaway'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              🛍️ สั่งกลับบ้าน
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            💡 แตะปุ่มเพื่ออัปเดตสถานะและแจ้งเตือนลูกค้ารับอาหารทันที
          </div>
        </div>

        {/* 3-Column KDS Touch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 items-start">
          {/* Column 1: รอรับออเดอร์ (Pending) */}
          <div className="bg-slate-100/80 rounded-3xl p-4 border border-amber-200/80 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">รอรับออเดอร์</h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                {pendingOrders.length}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                <Clock className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs font-semibold">ไม่มีออเดอร์ใหม่</p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5">
                {pendingOrders.map((order) => (
                  <KdsCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onPromptPrint={setPrintPromptOrder}
                    isLoading={updateStatusMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Column 2: กำลังเตรียมอาหาร (Preparing) */}
          <div className="bg-slate-100/80 rounded-3xl p-4 border border-sky-200/80 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-sky-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-brand-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">กำลังเตรียมอาหาร</h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-sky-100 text-brand-800 font-bold text-xs border border-sky-300">
                {preparingOrders.length}
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                <Utensils className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs font-semibold">ไม่มีออเดอร์ที่กำลังเตรียม</p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5">
                {preparingOrders.map((order) => (
                  <KdsCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onPromptPrint={setPrintPromptOrder}
                    isLoading={updateStatusMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Column 3: พร้อมรับอาหารแล้ว (Ready) */}
          <div className="bg-slate-100/80 rounded-3xl p-4 border border-emerald-200/80 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">พร้อมรับอาหารแล้ว</h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                {readyOrders.length}
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                <CheckCircle className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs font-semibold">ไม่มีออเดอร์ที่รอรับ</p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5">
                {readyOrders.map((order) => (
                  <KdsCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onPromptPrint={setPrintPromptOrder}
                    isLoading={updateStatusMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Print Queue Slip */}
      <PrintQueueModal
        order={printPromptOrder}
        isOpen={!!printPromptOrder}
        onClose={() => setPrintPromptOrder(null)}
        vendorName={vendor.name}
      />
    </div>
  );
}
