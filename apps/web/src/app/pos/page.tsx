'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import {
  PosHeader,
  PosMenuGrid,
  PosCartSidebar,
  PosItemModifierModal,
  PosCartItem,
  PosCashModal,
  PosPromptPayModal,
} from '@/components/pos';
import { PrintQueueModal } from '@/components/orders/PrintQueueModal';
import {
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from '@campus-food/shared-types';
import { Utensils, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PosPage() {
  const { vendor, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  // POS Cart State
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [orderNote, setOrderNote] = useState<string>('');

  // Modal States
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isPromptPayModalOpen, setIsPromptPayModalOpen] = useState(false);
  const [printedOrder, setPrintedOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch Vendor Menu Items
  const {
    data: rawMenuItems = [],
    isLoading: isMenuLoading,
    refetch: refetchMenu,
    isRefetching: isMenuRefetching,
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

  // Fetch Vendor Today Orders count
  const { data: rawOrders = [] } = useQuery<Order[]>({
    queryKey: ['vendor-orders', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const res = await apiClient<any>(`/orders/vendor/${vendor.id}`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!vendor?.id,
    refetchInterval: 15000,
  });

  const todayOrderCount = Array.isArray(rawOrders) ? rawOrders.length : 0;

  // Cart operations
  const getItemCartQuantity = (menuItemId: string) => {
    return cartItems
      .filter((i) => i.menuItem.id === menuItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
  };

  const handleConfirmModifier = (cartItem: PosCartItem) => {
    setCartItems((prev) => {
      // Check if identical item already exists with exact same options and note
      const existingIdx = prev.findIndex(
        (i) =>
          i.menuItem.id === cartItem.menuItem.id &&
          JSON.stringify(i.options || {}) === JSON.stringify(cartItem.options || {}) &&
          (i.customNote || '') === (cartItem.customNote || ''),
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const exist = updated[existingIdx];
        const newQty = exist.quantity + cartItem.quantity;
        updated[existingIdx] = {
          ...exist,
          quantity: newQty,
          subtotal: exist.unitPrice * newQty,
        };
        return updated;
      }
      return [...prev, cartItem];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setOrderNote('');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Submit Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async ({
      paymentMethod,
    }: {
      paymentMethod: PaymentMethod;
    }) => {
      if (!vendor?.id) throw new Error('ไม่พบข้อมูลร้านค้า');

      // 1. Create order in backend
      const payload = {
        vendorId: vendor.id,
        orderType,
        paymentMethod,
        note: orderNote.trim() || undefined,
        items: cartItems.map((ci) => ({
          menuItemId: ci.menuItem.id,
          quantity: ci.quantity,
          options: ci.options,
        })),
      };

      const newOrder = await apiClient<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // 2. Mark as PAID and ACCEPTED for instant POS flow
      try {
        await apiClient(`/orders/${newOrder.id}/mark-paid`, {
          method: 'PATCH',
          body: JSON.stringify({ paymentStatus: PaymentStatus.PAID }),
        });
        await apiClient(`/orders/${newOrder.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: OrderStatus.ACCEPTED }),
        });
      } catch (e) {
        console.warn('Auto accept failed, order was created:', e);
      }

      return newOrder;
    },
    onSuccess: (newOrder) => {
      setOrderError(null);
      setIsCashModalOpen(false);
      setIsPromptPayModalOpen(false);
      handleClearCart();

      // Refresh orders list
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });

      // Open print slip confirmation dialog
      setPrintedOrder(newOrder);
    },
    onError: (err: any) => {
      setOrderError(err?.message || 'เกิดข้อผิดพลาดในการสร้างออเดอร์');
      setTimeout(() => setOrderError(null), 5000);
    },
  });

  const handleConfirmCashPayment = async () => {
    await createOrderMutation.mutateAsync({ paymentMethod: PaymentMethod.CASH });
  };

  const handleConfirmPromptPayPayment = async () => {
    await createOrderMutation.mutateAsync({ paymentMethod: PaymentMethod.PROMPTPAY });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-700">กำลังเข้าสู่ระบบคิดเงินหน้าร้าน POS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !vendor) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">ระบบคิดเงินหน้าร้าน POS</h2>
          <p className="text-sm text-slate-500">
            จำเป็นต้องเข้าสู่ระบบบัญชีร้านค้าก่อนเริ่มรับออเดอร์หน้าร้าน
          </p>
          <Link
            href="/login?redirect=/pos"
            className="block w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all text-center"
          >
            เข้าสู่ระบบร้านค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F0F7FF] select-none overflow-hidden">
      {/* Top POS Header */}
      <PosHeader
        vendorName={vendor.name}
        isOpen={vendor.isOpen}
        onRefresh={() => refetchMenu()}
        isRefetching={isMenuRefetching}
        todayOrderCount={todayOrderCount}
      />

      {/* Error Alert if any */}
      {orderError && (
        <div className="mx-4 mt-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Main POS Split Screen: Menu Grid (Left) + Cart Sidebar (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Menu Grid */}
        <PosMenuGrid
          items={menuItems}
          isLoading={isMenuLoading}
          getItemCartQuantity={getItemCartQuantity}
          onSelectItem={handleSelectItem}
        />

        {/* Right: Cart Sidebar */}
        <PosCartSidebar
          cartItems={cartItems}
          orderType={orderType}
          orderNote={orderNote}
          onSetOrderType={setOrderType}
          onSetOrderNote={setOrderNote}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onOpenCashModal={() => setIsCashModalOpen(true)}
          onOpenPromptPayModal={() => setIsPromptPayModalOpen(true)}
          isSubmitting={createOrderMutation.isPending}
        />
      </div>

      {/* Item Modifier / Customization Modal */}
      <PosItemModifierModal
        item={selectedMenuItem}
        isOpen={!!selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
        onConfirm={handleConfirmModifier}
      />

      {/* Cash Payment Calculator Modal */}
      <PosCashModal
        isOpen={isCashModalOpen}
        totalPrice={totalPrice}
        onClose={() => setIsCashModalOpen(false)}
        onConfirm={handleConfirmCashPayment}
        isSubmitting={createOrderMutation.isPending}
      />

      {/* PromptPay QR Modal */}
      <PosPromptPayModal
        isOpen={isPromptPayModalOpen}
        totalPrice={totalPrice}
        vendorName={vendor.name}
        onClose={() => setIsPromptPayModalOpen(false)}
        onConfirm={handleConfirmPromptPayPayment}
        isSubmitting={createOrderMutation.isPending}
      />

      {/* Print Slip Confirmation Modal */}
      <PrintQueueModal
        order={printedOrder}
        isOpen={!!printedOrder}
        onClose={() => setPrintedOrder(null)}
        vendorName={vendor.name}
      />
    </div>
  );
}
