'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { audioChime } from '@/lib/audio-chime';
import { printQueueSlip } from '@/lib/print-slip';
import {
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  WsEvents,
  ShowPaymentQrPayload,
} from '@campus-food/shared-types';
import {
  QrCode,
  Printer,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Utensils,
  Package,
  ShieldCheck,
  Smartphone,
  Check,
  ChefHat,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

function SunmiDisplayContent() {
  const searchParams = useSearchParams();
  const { vendor, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const queryVendorId = searchParams.get('vendorId') || vendor?.id;
  const [activeVendor, setActiveVendor] = useState<{ id: string; name: string } | null>(null);

  // States
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);

  // Display Mode: 'standby' | 'payment_qr' | 'success'
  const [displayMode, setDisplayMode] = useState<'standby' | 'payment_qr' | 'success'>('standby');
  const [currentPayload, setCurrentPayload] = useState<ShowPaymentQrPayload | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Digital clock
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Fetch Vendor Info if vendorId is in query param
  const { data: fetchedVendor } = useQuery({
    queryKey: ['vendor-info', queryVendorId],
    queryFn: async () => {
      if (!queryVendorId) return null;
      try {
        const res = await apiClient<any>(`/vendors/${queryVendorId}`);
        return res;
      } catch {
        return null;
      }
    },
    enabled: !!queryVendorId,
  });

  useEffect(() => {
    if (vendor) {
      setActiveVendor({ id: vendor.id, name: vendor.name });
    } else if (fetchedVendor) {
      setActiveVendor({ id: fetchedVendor.id, name: fetchedVendor.name });
    } else if (queryVendorId) {
      setActiveVendor({ id: queryVendorId, name: 'ร้านค้า Campus Food' });
    }
  }, [vendor, fetchedVendor, queryVendorId]);

  // Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      setDateStr(
        now.toLocaleDateString('th-TH', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Real-time WebSocket Listeners for Sunmi V2
  useEffect(() => {
    const targetVendorId = activeVendor?.id;
    if (!targetVendorId) return;

    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Join vendor room
    socket.emit(WsEvents.JOIN_VENDOR_ROOM, { vendorId: targetVendorId });

    // 1. SHOW_PAYMENT_QR
    const handleShowPaymentQr = (payload: ShowPaymentQrPayload) => {
      console.log('⚡ [Sunmi V2] Received SHOW_PAYMENT_QR:', payload);
      setCurrentPayload(payload);
      setDisplayMode('payment_qr');
      if (soundEnabled) {
        audioChime.playReadyChime();
      }
    };

    // 2. CLEAR_PAYMENT_QR
    const handleClearPaymentQr = (payload: { vendorId: string; orderId?: string }) => {
      console.log('⚡ [Sunmi V2] Received CLEAR_PAYMENT_QR:', payload);
      setDisplayMode('standby');
      setCurrentPayload(null);
    };

    // 3. PRINT_QUEUE_TICKET
    const handlePrintQueueTicket = (payload: { vendorId: string; order: Order }) => {
      console.log('⚡ [Sunmi V2] Received PRINT_QUEUE_TICKET:', payload.order);
      setSuccessOrder(payload.order);
      setDisplayMode('success');

      if (soundEnabled) {
        audioChime.playReadyChime();
      }

      // Trigger automatic thermal printing for Sunmi V2 58mm
      if (autoPrintEnabled && payload.order) {
        setTimeout(() => {
          printQueueSlip(payload.order, {
            vendorName: activeVendor.name,
            paperWidth: '58mm',
            isWalkIn: true,
          });
        }, 300);
      }

      // Auto return to standby after 4.5 seconds
      setTimeout(() => {
        setDisplayMode('standby');
        setCurrentPayload(null);
        setSuccessOrder(null);
      }, 4500);
    };

    // 4. ORDER_STATUS_UPDATED (Auto-print if current order was marked PAID)
    const handleOrderStatusUpdated = (payload: { order: Order }) => {
      if (
        currentPayload &&
        payload.order.id === currentPayload.orderId &&
        payload.order.paymentStatus === PaymentStatus.PAID
      ) {
        handlePrintQueueTicket({ vendorId: targetVendorId, order: payload.order });
      }
    };

    socket.on(WsEvents.SHOW_PAYMENT_QR, handleShowPaymentQr);
    socket.on(WsEvents.CLEAR_PAYMENT_QR, handleClearPaymentQr);
    socket.on(WsEvents.PRINT_QUEUE_TICKET, handlePrintQueueTicket);
    socket.on(WsEvents.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);

    return () => {
      socket.emit(WsEvents.LEAVE_VENDOR_ROOM, { vendorId: targetVendorId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(WsEvents.SHOW_PAYMENT_QR, handleShowPaymentQr);
      socket.off(WsEvents.CLEAR_PAYMENT_QR, handleClearPaymentQr);
      socket.off(WsEvents.PRINT_QUEUE_TICKET, handlePrintQueueTicket);
      socket.off(WsEvents.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);
    };
  }, [activeVendor?.id, activeVendor?.name, soundEnabled, autoPrintEnabled, currentPayload]);

  // Test Print Button
  const handleTestPrint = () => {
    const mockOrder: Order = {
      id: `SUNMI-TEST-${Date.now().toString().slice(-4)}`,
      studentId: 'walk-in',
      vendorId: activeVendor?.id || 'vendor-1',
      orderType: OrderType.DINE_IN,
      status: OrderStatus.ACCEPTED,
      paymentMethod: PaymentMethod.PROMPTPAY,
      paymentStatus: PaymentStatus.PAID,
      totalPrice: 65,
      queueNumber: 99,
      items: [
        {
          id: 'item-1',
          orderId: 'mock',
          menuItemId: 'm1',
          quantity: 1,
          unitPrice: 55,
          subtotal: 55,
          menuItem: {
            id: 'm1',
            vendorId: 'vendor-1',
            name: 'ข้าวกะเพราหมูกรอบ (พิเศษ)',
            price: 55,
            category: 'อาหารจานเดียว',
            isDailySpecial: false,
            isAvailable: true,
          },
          options: { ระดับความเผ็ด: 'เผ็ดมาก' },
        },
        {
          id: 'item-2',
          orderId: 'mock',
          menuItemId: 'm2',
          quantity: 1,
          unitPrice: 10,
          subtotal: 10,
          menuItem: {
            id: 'm2',
            vendorId: 'vendor-1',
            name: 'ไข่ดาวกรอบ',
            price: 10,
            category: 'เครื่องเคียง',
            isDailySpecial: false,
            isAvailable: true,
          },
        },
      ],
      createdAt: new Date(),
    };

    printQueueSlip(mockOrder, {
      vendorName: activeVendor?.name || 'Campus Food',
      paperWidth: '58mm',
      isWalkIn: true,
    });
  };

  // Demo QR Simulation Button
  const handleSimulatePayment = () => {
    if (!currentPayload || !activeVendor) return;
    const socket = getSocket();
    socket.emit(WsEvents.PRINT_QUEUE_TICKET, {
      vendorId: activeVendor.id,
      order: {
        id: currentPayload.orderId,
        studentId: 'walk-in',
        vendorId: activeVendor.id,
        orderType: (currentPayload.orderType as OrderType) || OrderType.DINE_IN,
        status: OrderStatus.ACCEPTED,
        paymentMethod: PaymentMethod.PROMPTPAY,
        paymentStatus: PaymentStatus.PAID,
        totalPrice: currentPayload.totalPrice,
        queueNumber: currentPayload.queueNumber,
        items:
          currentPayload.order?.items ||
          currentPayload.itemsSummary.map((str, idx) => ({
            id: `item-${idx}`,
            orderId: currentPayload.orderId,
            menuItemId: `m-${idx}`,
            quantity: 1,
            unitPrice: currentPayload.totalPrice,
            subtotal: currentPayload.totalPrice,
            menuItem: {
              id: `m-${idx}`,
              vendorId: activeVendor.id,
              name: str,
              price: currentPayload.totalPrice,
              category: 'อาหาร',
              isDailySpecial: false,
              isAvailable: true,
            },
          })),
        createdAt: new Date(),
      },
    });
  };

  if (!activeVendor && isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F0FDFA] text-[#0F172A] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-md">
          <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-[#475569]">กำลังเชื่อมต่อเครื่อง Sunmi V2...</span>
        </div>
      </div>
    );
  }

  if (!activeVendor && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0FDFA] text-[#0F172A] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mx-auto border border-[#99F6E4] shadow-sm">
            <Smartphone className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#0F172A]">จอแสดง QR & เครื่องพิมพ์ Sunmi V2</h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            กรุณาเข้าสู่ระบบร้านค้า หรือเปิดผ่าน URL โดยระบุ <code className="text-[#0D9488] font-bold bg-[#CCFBF1] px-1.5 py-0.5 rounded-md">?vendorId=...</code> เพื่อเชื่อมต่อกับจอห้องครัว KDS
          </p>
          <Link
            href="/login?redirect=/sunmi"
            className="block w-full py-3.5 px-4 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-md shadow-teal-500/25 transition-all text-center"
          >
            เข้าสู่ระบบร้านค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FDFA] text-[#0F172A] flex flex-col justify-between selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
      {/* Top Compact Control Bar - Light Clean Theme */}
      <header className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between gap-2 shrink-0 shadow-xs sticky top-0 z-30">
        {/* Left: Store Name & Live Online Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black text-[#0F172A] truncate max-w-[140px] sm:max-w-[220px]">
              {activeVendor?.name || 'Campus Food'}
            </h1>
            <div className="flex items-center gap-1.5 text-[10px]">
              {isConnected ? (
                <span className="flex items-center gap-1 text-[#059669] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  เชื่อมต่อ KDS แล้ว
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#DC2626] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  กำลังเชื่อมต่อ...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>{timeStr}</span>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1.5">
          {/* Test Print Button */}
          <button
            onClick={handleTestPrint}
            className="p-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            title="ทดสอบพิมพ์สลิป 58mm"
          >
            <Printer className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="hidden md:inline text-[11px]">พิมพ์ทดสอบ</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] transition-all shadow-2xs"
            title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#0D9488]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] transition-all shadow-2xs"
            title="ขยายเต็มจอ"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Dynamic Display Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 text-center select-none">
        {/* ======================================================== */}
        {/* MODE 1: STANDBY (หน้าต้อนรับ / "สแกนตรงนี้") */}
        {/* ======================================================== */}
        {displayMode === 'standby' && (
          <div className="max-w-md w-full flex flex-col items-center gap-5 animate-fade-in py-6">
            {/* Animated Glow Halo */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-brand-500/15 blur-xl absolute inset-0 animate-pulse" />
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-brand-600 via-teal-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-teal-500/25 relative z-10 border-2 border-white">
                <QrCode className="w-14 h-14 animate-pulse-subtle" />
              </div>
            </div>

            {/* Welcome & Call to Action Text */}
            <div className="space-y-1.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4] inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                จุดสแกนจ่ายเงิน & รับบัตรคิว
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                สแกนตรงนี้
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-xs mx-auto leading-relaxed">
                สั่งอาหารที่เคาน์เตอร์แล้วสแกน QR พร้อมเพย์ที่หน้าจอนี้เพื่อชำระเงินและรับบัตรคิวได้ทันที
              </p>
            </div>

            {/* Prompt Feature Cards - Clean Light Theme */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] flex flex-col items-center gap-1.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center border border-[#99F6E4]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">สแกนจ่ายง่าย</span>
                <span className="text-[10px] text-[#475569] font-medium">ทุกแอปธนาคาร</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] flex flex-col items-center gap-1.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center border border-[#A7F3D0]">
                  <Printer className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">พิมพ์บัตรคิวทันที</span>
                <span className="text-[10px] text-[#475569] font-medium">หลังจ่ายเงินสำเร็จ</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: PAYMENT QR */}
        {/* ======================================================== */}
        {displayMode === 'payment_qr' && currentPayload && (
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#E2E8F0] flex flex-col items-center gap-3.5 animate-scale-up text-center text-[#0F172A] my-auto">
            {/* Header: Thai QR Payment Badge + Title + Close Button */}
            <div className="flex items-center justify-between w-full border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#0D9488] text-white font-bold text-[11px] tracking-tight shadow-2xs">
                  Thai QR Payment
                </span>
                <h3 className="font-bold text-[#0F172A] text-sm">สแกนตรงนี้</h3>
              </div>

              <button
                onClick={() => {
                  setDisplayMode('standby');
                  setCurrentPayload(null);
                }}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Store Name & Queue Badge */}
            <div className="space-y-0.5">
              <p className="text-xs text-[#475569] font-medium">
                {activeVendor?.name || 'Campus Food'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#0D9488] tracking-tight">
                  ฿{currentPayload.totalPrice.toLocaleString()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0D9488] font-black text-xs border border-[#99F6E4]">
                  คิว #{currentPayload.queueNumber}
                </span>
              </div>
            </div>

            {/* Centered High-Contrast PromptPay QR Code Box */}
            <div className="p-3 bg-white border-2 border-[#99F6E4] rounded-3xl shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  currentPayload.promptpayQrPayload ||
                    `00020101021229370016A000000677010111011300668123456785303764540${currentPayload.totalPrice.toFixed(
                      2,
                    )}5802TH6304`,
                )}`}
                alt="PromptPay QR Code"
                className="w-56 h-56 sm:w-60 sm:h-60 object-contain mx-auto rounded-xl"
              />
            </div>

            {/* Bank Scan Verification Badge */}
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4] text-xs font-semibold w-full">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>สแกนตรงนี้ ผ่านแอปธนาคารได้ทุกแห่ง</span>
            </div>

            {/* Items Summary if available */}
            {currentPayload.itemsSummary && currentPayload.itemsSummary.length > 0 && (
              <p className="text-[11px] text-[#475569] line-clamp-1 font-medium px-1">
                {currentPayload.itemsSummary.join(', ')}
              </p>
            )}

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] text-[11px] font-medium w-full">
              <Printer className="w-4 h-4 text-[#059669] shrink-0" />
              <span>เมื่อชำระเงินเสร็จ เครื่องจะพิมพ์บัตรคิวให้อัตโนมัติ</span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: SUCCESS & PRINT */}
        {/* ======================================================== */}
        {displayMode === 'success' && successOrder && (
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl flex flex-col items-center gap-5 animate-scale-up py-8 my-auto">
            {/* Animated Checkmark Circle */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-emerald-500/20 blur-xl absolute inset-0 animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 relative z-10 border-4 border-white">
                <Check className="w-14 h-14 stroke-[3] animate-bounce" />
              </div>
            </div>

            {/* Success Info */}
            <div className="space-y-1.5 text-center">
              <span className="px-4 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-black inline-block shadow-2xs">
                คิวของคุณคือ #{successOrder.queueNumber}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                ชำระเงินสำเร็จแล้ว! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-bold flex items-center justify-center gap-2">
                <Printer className="w-4 h-4 text-[#0D9488] animate-spin" />
                <span>กำลังพิมพ์บัตรคิว... กรุณารอสักครู่</span>
              </p>
            </div>

            {/* Total Paid */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] w-full max-w-xs space-y-0.5">
              <span className="text-[11px] text-[#475569] font-bold">ยอดที่ชำระเรียบร้อย</span>
              <p className="text-2xl font-black text-[#059669]">
                ฿{Number(successOrder.totalPrice).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Info for Sunmi Device */}
      <footer className="px-4 py-2.5 bg-white/90 border-t border-[#E2E8F0] text-[11px] text-[#475569] flex items-center justify-between shrink-0">
        <span className="font-semibold text-[#0F172A]">Sunmi V2 POS Terminal</span>
        <span className="text-[#059669] font-medium">Auto Thermal Print 58mm Enabled ✅</span>
      </footer>
    </div>
  );
}

export default function SunmiDisplayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0FDFA] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SunmiDisplayContent />
    </Suspense>
  );
}
