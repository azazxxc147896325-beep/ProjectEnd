'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { audioChime } from '@/lib/audio-chime';
import { CustomerHeader, CustomerQueueBoard } from '@/components/kds';
import { Order, OrderStatus, WsEvents } from '@campus-food/shared-types';
import { Utensils, Bell } from 'lucide-react';
import Link from 'next/link';

export default function CustomerQueueDisplayPage() {
  const searchParams = useSearchParams();
  const { vendor, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryVendorId = searchParams.get('vendorId') || vendor?.id;
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [readyChimeAlert, setReadyChimeAlert] = useState<string | null>(null);

  // Fetch Vendor Orders
  const {
    data: rawOrders = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Order[]>({
    queryKey: ['customer-queue-orders', queryVendorId],
    queryFn: async () => {
      if (!queryVendorId) return [];
      const res = await apiClient<any>(`/orders/vendor/${queryVendorId}`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!queryVendorId,
    refetchInterval: 10000,
  });

  const orders = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any)?.data || [];

  // Real-time WebSocket Listeners for Live Queue Updates
  useEffect(() => {
    if (!queryVendorId) return;
    const socket = getSocket();

    socket.emit(WsEvents.JOIN_VENDOR_ROOM, { vendorId: queryVendorId });

    const handleNewOrder = (payload: { order: Order }) => {
      console.log('⚡ [Customer Display] Real-time New Order:', payload.order);
      queryClient.setQueryData<Order[]>(['customer-queue-orders', queryVendorId], (old) => {
        const list = Array.isArray(old) ? old : [];
        const exists = list.some((o) => o.id === payload.order.id);
        if (exists) return list;
        return [payload.order, ...list];
      });
    };

    const handleStatusUpdated = (payload: { order: Order }) => {
      console.log('⚡ [Customer Display] Real-time Status Updated:', payload.order.id, payload.order.status);
      
      // When an order is ready, play chime and flash banner
      if (payload.order.status === OrderStatus.READY) {
        if (soundEnabled) {
          audioChime.playReadyChime();
        }
        setReadyChimeAlert(`🎉 คิว #${payload.order.queueNumber} อาหารพร้อมรับแล้วครับ!`);
        setTimeout(() => setReadyChimeAlert(null), 8000);
      }

      queryClient.setQueryData<Order[]>(['customer-queue-orders', queryVendorId], (old) => {
        const list = Array.isArray(old) ? old : [];
        return list.map((o) => (o.id === payload.order.id ? payload.order : o));
      });
    };

    socket.on(WsEvents.NEW_ORDER, handleNewOrder);
    socket.on(WsEvents.ORDER_STATUS_UPDATED, handleStatusUpdated);

    return () => {
      socket.emit(WsEvents.LEAVE_VENDOR_ROOM, { vendorId: queryVendorId });
      socket.off(WsEvents.NEW_ORDER, handleNewOrder);
      socket.off(WsEvents.ORDER_STATUS_UPDATED, handleStatusUpdated);
    };
  }, [queryVendorId, queryClient, soundEnabled]);

  if (isAuthLoading && !queryVendorId) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-700">กำลังเชื่อมต่อจอเรียกคิวลูกค้า...</span>
        </div>
      </div>
    );
  }

  if (!queryVendorId && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">จอเรียกคิวอาหารหน้าร้าน</h2>
          <p className="text-sm text-slate-500">
            กรุณาเข้าสู่ระบบร้านค้า หรือเปิดผ่าน URL ที่ระบุร้านค้าเพื่อแสดงผลคิว
          </p>
          <Link
            href="/login?redirect=/queue-display"
            className="block w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all text-center"
          >
            เข้าสู่ระบบร้านค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Customer Display Header */}
      <CustomerHeader
        vendorName={vendor?.name || 'ร้านอาหาร'}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onRefresh={() => refetch()}
        isRefetching={isRefetching}
      />

      {/* Ready Alert Chime Toast */}
      {readyChimeAlert && (
        <div className="mx-4 lg:mx-8 mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-black text-base shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 animate-spin" />
            <span>{readyChimeAlert}</span>
          </div>
          <button
            onClick={() => setReadyChimeAlert(null)}
            className="text-xs px-3.5 py-1 rounded-full bg-white/20 hover:bg-white/30 font-bold transition-all"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Customer Queue Board Component */}
      <CustomerQueueBoard orders={orders} vendorName={vendor?.name} />
    </div>
  );
}
