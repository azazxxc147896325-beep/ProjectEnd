'use client';

import React from 'react';
import { Order, OrderStatus } from '@campus-food/shared-types';
import { ChefHat, BellRing, Sparkles, Utensils } from 'lucide-react';
import { clsx } from 'clsx';

interface CustomerQueueBoardProps {
  orders: Order[];
  vendorName?: string;
}

export function CustomerQueueBoard({ orders, vendorName }: CustomerQueueBoardProps) {
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Preparing orders (PENDING, ACCEPTED, or COOKING) - sorted FIFO (earliest queue first)
  const preparingOrders = safeOrders
    .filter(
      (o) =>
        o &&
        (o.status === OrderStatus.PENDING ||
          o.status === OrderStatus.ACCEPTED ||
          o.status === OrderStatus.COOKING),
    )
    .sort((a, b) => a.queueNumber - b.queueNumber);

  // Ready orders (READY) - sorted FIFO (earliest queue first)
  const readyOrders = safeOrders
    .filter((o) => o && o.status === OrderStatus.READY)
    .sort((a, b) => a.queueNumber - b.queueNumber);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 min-h-[calc(100vh-80px)]">
      {/* Top Banner Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0F172A] tracking-tight">
              {vendorName ? `สถานะคิวรับอาหาร - ${vendorName}` : 'สถานะคิวรับอาหาร'}
            </h2>
            <p className="text-xs text-[#475569] font-medium">
              เมื่อหมายเลขคิวของท่านขึ้นในช่องสีเขียว (พร้อมรับอาหาร) กรุณาติดต่อรับที่เคาน์เตอร์หน้าร้าน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>กำลังเตรียม: {preparingOrders.length} คิว</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>พร้อมรับ: {readyOrders.length} คิว</span>
          </div>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Column 1: กำลังปรุงอาหาร (Preparing) */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-5 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-[#0F172A] tracking-tight">
                  กำลังเตรียมอาหาร
                </h3>
                <p className="text-xs lg:text-sm text-[#475569] font-medium">Preparing in Kitchen</p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-2xl bg-[#FFFBEB] text-[#D97706] font-black text-sm lg:text-base border border-[#FDE68A]">
              {preparingOrders.length} คิว
            </span>
          </div>

          <div className="flex-1 py-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] py-16">
                <ChefHat className="w-16 h-16 opacity-30 mb-3" />
                <p className="text-base font-bold">ไม่มีรายการที่กำลังเตรียม</p>
                <p className="text-xs text-[#94A3B8] mt-1">คิวใหม่จะแสดงขึ้นที่นี่อัตโนมัติ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#F8FAFC] hover:bg-[#CCFBF1]/30 border-2 border-[#E2E8F0] rounded-2xl p-4 lg:p-5 flex flex-col items-center justify-center shadow-xs transition-all animate-fade-in"
                  >
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                      คิวหมายเลข
                    </span>
                    <span className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#0F172A] font-mono tracking-tight my-1">
                      #{order.queueNumber}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 text-[#475569] mt-1 truncate max-w-full">
                      {order.orderType === 'dine_in' ? '🍽️ ทานที่ร้าน' : '🛍️ สั่งกลับบ้าน'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: พร้อมรับอาหารแล้ว (Ready for Pickup) */}
        <div className="bg-gradient-to-b from-[#ECFDF5]/60 via-[#ECFDF5]/20 to-white rounded-3xl p-6 lg:p-8 border-2 border-[#A7F3D0] shadow-md flex flex-col">
          <div className="flex items-center justify-between pb-5 border-b border-[#A7F3D0]/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#059669] text-white shadow-md shadow-emerald-600/25 flex items-center justify-center">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-[#064E3B] tracking-tight flex items-center gap-2">
                  <span>พร้อมรับอาหารแล้ว</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h3>
                <p className="text-xs lg:text-sm text-[#059669] font-medium">Ready for Pickup at Counter</p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-2xl bg-[#059669] text-white font-black text-sm lg:text-base shadow-xs">
              {readyOrders.length} คิว
            </span>
          </div>

          <div className="flex-1 py-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#059669]/50 py-16">
                <BellRing className="w-16 h-16 opacity-30 mb-3" />
                <p className="text-base font-bold">รอเรียกคิว...</p>
                <p className="text-xs text-[#059669]/70 mt-1">เมื่ออาหารปรุงเสร็จแล้ว หมายเลขคิวจะปรากฏที่นี่</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-[#059669] rounded-3xl p-5 lg:p-6 flex flex-col items-center justify-center shadow-lg shadow-emerald-600/10 ring-4 ring-emerald-400/20 animate-pulse-subtle"
                  >
                    <span className="text-xs font-black text-[#059669] uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span>🔔 เชิญรับอาหาร</span>
                    </span>
                    <span className="text-4xl lg:text-5xl xl:text-6xl font-black text-[#059669] font-mono tracking-tight my-1.5">
                      #{order.queueNumber}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        {order.student?.fullName || 'ลูกค้า'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
