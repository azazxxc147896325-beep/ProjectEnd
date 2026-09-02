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
import { getSocket } from '@/lib/socket';
import {
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  WsEvents,
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

      const fullNote = orderNote.trim()
        ? `[หน้าร้าน/POS] ${orderNote.trim()}`
        : '[หน้าร้าน/POS]';

      // 1. Create order in backend
      const payload = {
        vendorId: vendor.id,
        orderType,
        paymentMethod,
        note: fullNote,
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

      // 2. Mark as PAID (keeps status PENDING so kitchen cook accepts it in order)
      let paidOrder: Order = newOrder;
      try {
        paidOrder = await apiClient<Order>(`/orders/${newOrder.id}/mark-paid`, {
          method: 'PATCH',
          body: JSON.stringify({ paymentStatus: PaymentStatus.PAID }),
        });
      } catch (e) {
        console.warn('Mark paid failed, order was created:', e);
      }

      // 3. Emit PRINT_QUEUE_TICKET to Sunmi V2
      try {
        const socket = getSocket();
        socket.emit(WsEvents.PRINT_QUEUE_TICKET, {
          vendorId: vendor.id,
          order: paidOrder || newOrder,
        });
      } catch (err) {
        console.warn('Sunmi print emit failed:', err);
      }

      return paidOrder || newOrder;
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

  const handleOpenPromptPayModal = () => {
    setIsPromptPayModalOpen(true);
    // Push QR to Sunmi V2
    if (vendor?.id) {
      const socket = getSocket();
      const qrPayload = `00020101021229370016A000000677010111011300668123456785303764540${totalPrice.toFixed(
        2,
      )}5802TH6304`;

      socket.emit(WsEvents.SHOW_PAYMENT_QR, {
        vendorId: vendor.id,
        orderId: `POS-${Date.now().toString().slice(-4)}`,
        queueNumber: todayOrderCount + 1,
        totalPrice,
        promptpayQrPayload: qrPayload,
        orderType,
        itemsSummary: cartItems.map((ci) => `${ci.quantity}x ${ci.menuItem.name}`),
      });
    }
  };

  const handleClosePromptPayModal = () => {
    setIsPromptPayModalOpen(false);
    if (vendor?.id) {
      const socket = getSocket();
      socket.emit(WsEvents.CLEAR_PAYMENT_QR, { vendorId: vendor.id });
    }
  };

  const handleConfirmCashPayment = async () => {
    await createOrderMutation.mutateAsync({ paymentMethod: PaymentMethod.CASH });
  };

  const handleConfirmPromptPayPayment = async () => {
    await createOrderMutation.mutateAsync({ paymentMethod: PaymentMethod.PROMPTPAY });
  };


  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F0FDFA] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0]">
          <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-[#475569]">กำลังเข้าสู่ระบบคิดเงินหน้าร้าน POS...</span>
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
          <h2 className="text-xl font-black text-[#0F172A]">ระบบคิดเงินหน้าร้าน POS</h2>
          <p className="text-sm text-[#475569]">
            จำเป็นต้องเข้าสู่ระบบบัญชีร้านค้าก่อนเริ่มรับออเดอร์หน้าร้าน
          </p>
          <Link
            href="/login?redirect=/pos"
            className="block w-full py-3 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-md shadow-teal-500/25 transition-all text-center"
          >
            เข้าสู่ระบบร้านค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F0FDFA] select-none overflow-hidden">
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
          onOpenPromptPayModal={handleOpenPromptPayModal}
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
        onClose={handleClosePromptPayModal}
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
