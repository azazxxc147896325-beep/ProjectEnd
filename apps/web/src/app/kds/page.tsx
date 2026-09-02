'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
  KdsHeader,
  KdsCard,
  KdsWalkInOrderDrawer,
  KdsQrWaitModal,
} from '@/components/kds';
import { PrintQueueModal } from '@/components/orders';
import { PosCartItem } from '@/components/pos';
import {
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  WsEvents,
} from '@campus-food/shared-types';
import { Clock, Utensils, CheckCircle, Bell, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function KdsPage() {
  const { vendor, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<string>('all');
  const [newOrderBanner, setNewOrderBanner] = useState<string | null>(null);
  const [printPromptOrder, setPrintPromptOrder] = useState<Order | null>(null);

  // Walk-in Order Modal & Drawer State
  const [isWalkInDrawerOpen, setIsWalkInDrawerOpen] = useState(false);
  const [isQrWaitModalOpen, setIsQrWaitModalOpen] = useState(false);
  const [activeQrOrder, setActiveQrOrder] = useState<Order | null>(null);
  const [activeQrTotal, setActiveQrTotal] = useState<number>(0);
  const [orderError, setOrderError] = useState<string | null>(null);

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

  // Fetch Vendor Menu Items for Walk-in POS Drawer
  const {
    data: rawMenuItems = [],
    isLoading: isMenuLoading,
  } = useQuery<MenuItem[]>({
    queryKey: ['vendor-menu', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const res = await apiClient<any>(`/menu/vendor/${vendor.id}?includeUnavailable=false`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!vendor?.id,
  });

  const menuItems = Array.isArray(rawMenuItems) ? rawMenuItems : [];

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!vendor?.id) return;
    const socket = getSocket();

    socket.emit(WsEvents.JOIN_VENDOR_ROOM, { vendorId: vendor.id });

    const handleNewOrder = (payload: { order: Order }) => {
      console.log('⚡ [KDS] Real-time New Order:', payload.order);

      const isWalkIn =
        payload.order.note?.includes('[POS]') ||
        payload.order.note?.includes('[หน้าร้าน]') ||
        payload.order.studentId === vendor.id;

      setNewOrderBanner(
        `🔔 ${isWalkIn ? 'ออเดอร์หน้าร้าน' : 'ออเดอร์ออนไลน์'} คิว #${payload.order.queueNumber} (${payload.order.items.length} รายการ)`,
      );
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

  // Create Walk-in Order Mutation (Cash or QR)
  const createWalkInOrderMutation = useMutation({
    mutationFn: async ({
      cart,
      paymentMethod,
    }: {
      cart: {
        items: PosCartItem[];
        orderType: OrderType;
        orderNote: string;
        totalPrice: number;
      };
      paymentMethod: PaymentMethod;
    }) => {
      if (!vendor?.id) throw new Error('ไม่พบข้อมูลร้านค้า');

      const fullNote = cart.orderNote
        ? `[หน้าร้าน/POS] ${cart.orderNote}`
        : '[หน้าร้าน/POS]';

      const payload = {
        vendorId: vendor.id,
        orderType: cart.orderType,
        paymentMethod,
        note: fullNote,
        items: cart.items.map((ci) => ({
          menuItemId: ci.menuItem.id,
          quantity: ci.quantity,
          options: ci.options,
        })),
      };

      const newOrder = await apiClient<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return newOrder;
    },
  });

  // Handle Walk-in QR Payment -> Push QR to Sunmi V2 Screen
  const handleWalkInQrPayment = async (cart: {
    items: PosCartItem[];
    orderType: OrderType;
    orderNote: string;
    totalPrice: number;
  }) => {
    try {
      setOrderError(null);
      const newOrder = await createWalkInOrderMutation.mutateAsync({
        cart,
        paymentMethod: PaymentMethod.PROMPTPAY,
      });

      // Emit SHOW_PAYMENT_QR to Sunmi V2 via socket
      const socket = getSocket();
      const itemsSummary = cart.items.map(
        (i) => `${i.quantity}x ${i.menuItem.name}`,
      );

      socket.emit(WsEvents.SHOW_PAYMENT_QR, {
        vendorId: vendor?.id,
        orderId: newOrder.id,
        queueNumber: newOrder.queueNumber,
        totalPrice: cart.totalPrice,
        promptpayQrPayload: newOrder.promptpayQrPayload,
        orderType: newOrder.orderType,
        itemsSummary,
        order: newOrder,
      });

      setActiveQrOrder(newOrder);
      setActiveQrTotal(cart.totalPrice);
      setIsWalkInDrawerOpen(false);
      setIsQrWaitModalOpen(true);
    } catch (err: any) {
      setOrderError(err?.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ QR');
    }
  };

  // Handle Staff Confirming QR Paid (Marks paid & triggers Sunmi print, sends to PENDING queue)
  const handleConfirmQrPaid = async () => {
    if (!activeQrOrder || !vendor?.id) return;
    try {
      // 1. Mark paid in backend (keeps status PENDING so cook can accept it in order)
      const updatedOrder = await apiClient<Order>(`/orders/${activeQrOrder.id}/mark-paid`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus: PaymentStatus.PAID }),
      });

      // 2. Emit PRINT_QUEUE_TICKET to Sunmi V2 to print queue slip for customer
      const socket = getSocket();
      socket.emit(WsEvents.PRINT_QUEUE_TICKET, {
        vendorId: vendor.id,
        order: updatedOrder || { ...activeQrOrder, paymentStatus: PaymentStatus.PAID },
      });

      // 3. Invalidate and close modal
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor.id] });
      setIsQrWaitModalOpen(false);
      setActiveQrOrder(null);
    } catch (e) {
      console.error('Error confirming QR paid:', e);
      setIsQrWaitModalOpen(false);
    }
  };

  // Handle Cancel QR Waiting Modal
  const handleCancelQrModal = () => {
    if (vendor?.id) {
      const socket = getSocket();
      socket.emit(WsEvents.CLEAR_PAYMENT_QR, {
        vendorId: vendor.id,
        orderId: activeQrOrder?.id,
      });
    }
    setIsQrWaitModalOpen(false);
    setActiveQrOrder(null);
  };

  // Handle Walk-in Cash Payment -> Mark Paid & Send to PENDING queue
  const handleWalkInCashPayment = async (cart: {
    items: PosCartItem[];
    orderType: OrderType;
    orderNote: string;
    totalPrice: number;
  }) => {
    try {
      setOrderError(null);
      const newOrder = await createWalkInOrderMutation.mutateAsync({
        cart,
        paymentMethod: PaymentMethod.CASH,
      });

      // Mark cash as PAID (order stays in PENDING so cook can accept it)
      const paidOrder = await apiClient<Order>(`/orders/${newOrder.id}/mark-paid`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus: PaymentStatus.PAID }),
      });

      // Emit PRINT_QUEUE_TICKET to Sunmi V2
      const socket = getSocket();
      socket.emit(WsEvents.PRINT_QUEUE_TICKET, {
        vendorId: vendor?.id,
        order: paidOrder || { ...newOrder, paymentStatus: PaymentStatus.PAID },
      });

      // Close drawer & refresh
      setIsWalkInDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });
    } catch (err: any) {
      setOrderError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อเงินสด');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F0FDFA] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-[#475569]">กำลังเข้าสู่ระบบจอคิวห้องครัว KDS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !vendor) {
    return (
      <div className="min-h-screen bg-[#F0FDFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4] flex items-center justify-center mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-[#0F172A]">จอห้องครัว KDS (Kitchen Display)</h2>
          <p className="text-sm text-[#475569]">
            ระบบจอแสดงผลคิวสำหรับ iPad และแท็บเล็ตในครัว จำเป็นต้องเข้าสู่ระบบบัญชีร้านค้าก่อนใช้งาน
          </p>
          <Link
            href="/login?redirect=/kds"
            className="block w-full py-3 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-md shadow-teal-500/25 transition-all text-center"
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
    <div className="min-h-screen bg-[#F0FDFA] flex flex-col selection:bg-brand-500 selection:text-white">
      {/* KDS Header Bar with Walk-in Order Button */}
      <KdsHeader
        vendorName={vendor.name}
        onRefresh={() => refetch()}
        isRefetching={isRefetching}
        totalActiveCount={totalActiveCount}
        onOpenWalkInOrder={() => setIsWalkInDrawerOpen(true)}
      />

      {/* Error Banner */}
      {orderError && (
        <div className="mx-4 lg:mx-6 mt-3 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] font-bold text-xs flex items-center justify-between animate-shake">
          <span>⚠️ {orderError}</span>
          <button
            onClick={() => setOrderError(null)}
            className="text-xs px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Realtime Alert Banner */}
      {newOrderBanner && (
        <div className="mx-4 lg:mx-6 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#0D9488] text-white font-black text-sm shadow-lg flex items-center justify-between animate-bounce">
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
        {/* Quick Filter Bar & Walk-in Fast Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterType === 'all'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F0FDFA]',
              )}
            >
              ทั้งหมด ({totalActiveCount})
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterType === 'dine_in'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F0FDFA]',
              )}
            >
              🍽️ ทานที่ร้าน
            </button>
            <button
              onClick={() => setFilterType('takeaway')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filterType === 'takeaway'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F0FDFA]',
              )}
            >
              🛍️ สั่งกลับบ้าน
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWalkInDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#CCFBF1] hover:bg-teal-100 text-[#0D9488] text-xs font-bold border border-[#99F6E4] transition-colors shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>+ สั่งอาหารหน้าร้าน</span>
            </button>
            <div className="text-xs text-[#475569] font-semibold px-2 hidden md:block">
              💡 สั่งหน้าร้านจะพิมพ์บัตรคิวที่ Sunmi V2 และเข้าคิวทำอาหารทันที
            </div>
          </div>
        </div>

        {/* 3-Column KDS Touch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 items-start">
          {/* Column 1: รอรับออเดอร์ (Pending - สำหรับออเดอร์ออนไลน์) */}
          <div className="bg-white/90 rounded-3xl p-4 border border-[#FDE68A] flex flex-col gap-3 min-h-[500px] shadow-xs">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-[#FDE68A]/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#0F172A]">รอรับออเดอร์</h3>
                  <span className="text-[10px] text-[#D97706] font-medium">เฉพาะสั่งออนไลน์</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#FFFBEB] text-[#D97706] font-bold text-xs border border-[#FDE68A]">
                {pendingOrders.length}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] py-16 text-center">
                <Clock className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs font-semibold">ไม่มีออเดอร์ออนไลน์ใหม่</p>
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

          {/* Column 2: กำลังเตรียมอาหาร (Preparing - รับแล้ว + สั่งหน้าร้าน) */}
          <div className="bg-white/90 rounded-3xl p-4 border border-[#99F6E4] flex flex-col gap-3 min-h-[500px] shadow-xs">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-[#99F6E4]/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#0F172A]">กำลังเตรียมอาหาร</h3>
                  <span className="text-[10px] text-[#0D9488] font-medium">ทำอาหาร & เรียกคิว</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#CCFBF1] text-[#0D9488] font-bold text-xs border border-[#99F6E4]">
                {preparingOrders.length}
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] py-16 text-center">
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
          <div className="bg-white/90 rounded-3xl p-4 border border-[#A7F3D0] flex flex-col gap-3 min-h-[500px] shadow-xs">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-[#A7F3D0]/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#0F172A]">พร้อมรับอาหารแล้ว</h3>
                  <span className="text-[10px] text-[#059669] font-medium">รอส่งมอบลูกค้า</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#ECFDF5] text-[#059669] font-bold text-xs border border-[#A7F3D0]">
                {readyOrders.length}
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] py-16 text-center">
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

      {/* Walk-in Order Taking Drawer inside KDS */}
      <KdsWalkInOrderDrawer
        isOpen={isWalkInDrawerOpen}
        onClose={() => setIsWalkInDrawerOpen(false)}
        menuItems={menuItems}
        isMenuLoading={isMenuLoading}
        vendorName={vendor.name}
        onConfirmQrPayment={handleWalkInQrPayment}
        onConfirmCashPayment={handleWalkInCashPayment}
        isSubmitting={createWalkInOrderMutation.isPending}
      />

      {/* Sunmi V2 QR Waiting Modal */}
      <KdsQrWaitModal
        isOpen={isQrWaitModalOpen}
        order={activeQrOrder}
        totalPrice={activeQrTotal}
        vendorName={vendor.name}
        onClose={handleCancelQrModal}
        onConfirmPaid={handleConfirmQrPaid}
      />

      {/* Online Order Manual Print Confirmation Modal */}
      <PrintQueueModal
        order={printPromptOrder}
        isOpen={!!printPromptOrder}
        onClose={() => setPrintPromptOrder(null)}
        vendorName={vendor.name}
      />
    </div>
  );
}

