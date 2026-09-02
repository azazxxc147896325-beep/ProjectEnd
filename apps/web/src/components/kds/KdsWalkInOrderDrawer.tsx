'use client';

import React, { useState, useMemo } from 'react';
import { MenuItem, OrderType, PaymentMethod } from '@campus-food/shared-types';
import { PosCartItem, PosItemModifierModal, PosCashModal } from '@/components/pos';
import {
  X,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Banknote,
  Utensils,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  UtensilsCrossed,
} from 'lucide-react';
import { clsx } from 'clsx';

interface KdsWalkInOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  isMenuLoading: boolean;
  vendorName: string;
  onConfirmQrPayment: (cart: {
    items: PosCartItem[];
    orderType: OrderType;
    orderNote: string;
    totalPrice: number;
  }) => Promise<void>;
  onConfirmCashPayment: (cart: {
    items: PosCartItem[];
    orderType: OrderType;
    orderNote: string;
    totalPrice: number;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function KdsWalkInOrderDrawer({
  isOpen,
  onClose,
  menuItems,
  isMenuLoading,
  vendorName,
  onConfirmQrPayment,
  onConfirmCashPayment,
  isSubmitting,
}: KdsWalkInOrderDrawerProps) {
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [orderNote, setOrderNote] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menuItems]);

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return item.isAvailable !== false;
    });
  }, [menuItems, selectedCategory, searchQuery]);

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

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const isCartEmpty = cartItems.length === 0;

  const handleTriggerQrPayment = async () => {
    if (isCartEmpty) return;
    await onConfirmQrPayment({
      items: cartItems,
      orderType,
      orderNote,
      totalPrice,
    });
  };

  const handleTriggerCashPayment = async () => {
    if (isCartEmpty) return;
    await onConfirmCashPayment({
      items: cartItems,
      orderType,
      orderNote,
      totalPrice,
    });
    setIsCashModalOpen(false);
    handleClearCart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col animate-slide-left overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0F172A]">รับออเดอร์หน้าร้าน (Walk-in POS)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                  เครื่อง Sunmi V2 🖨️
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium">
                ร้าน: <span className="font-bold text-[#0F172A]">{vendorName}</span> • สั่งเสร็จส่ง QR ไปจอ Sunmi V2 และปริ้นบัตรคิวอัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#CCFBF1] text-[#475569] hover:text-[#0D9488] transition-colors"
            title="ปิดหน้าต่างรับออเดอร์"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Drawer Body: 2-Column Split (Left: Menu, Right: Cart) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Menu Selector */}
          <div className="flex-1 flex flex-col p-4 lg:p-6 bg-[#F8FAFC] border-r border-[#E2E8F0] min-w-0 overflow-hidden">
            {/* Search & Category Pills */}
            <div className="space-y-3 mb-4 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่ออาหารหรือเครื่องดื่ม..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-sm font-medium text-[#0F172A] focus:outline-hidden focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-[#94A3B8] hover:text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={clsx(
                    'px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs',
                    selectedCategory === 'all'
                      ? 'bg-[#0D9488] text-white shadow-teal-500/20'
                      : 'bg-white text-[#475569] hover:bg-[#F0FDFA] border border-[#E2E8F0]',
                  )}
                >
                  ทั้งหมด ({menuItems.length})
                </button>
                {categories.map((cat) => {
                  const count = menuItems.filter((i) => i.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={clsx(
                        'px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs',
                        selectedCategory === cat
                          ? 'bg-[#0D9488] text-white shadow-teal-500/20'
                          : 'bg-white text-[#475569] hover:bg-[#F0FDFA] border border-[#E2E8F0]',
                      )}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Touch Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isMenuLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-[#94A3B8] gap-2">
                  <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">กำลังโหลดรายการอาหาร...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-[#94A3B8] border-2 border-dashed border-[#E2E8F0] rounded-3xl bg-white/60 p-6 text-center">
                  <UtensilsCrossed className="w-10 h-10 opacity-30 mb-2" />
                  <p className="text-sm font-bold text-[#475569]">ไม่พบรายการอาหาร</p>
                  <p className="text-xs text-[#94A3B8]">ลองค้นหาด้วยคำอื่น</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredItems.map((item) => {
                    const inCartCount = getItemCartQuantity(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className={clsx(
                          'p-3.5 rounded-2xl bg-white border text-left transition-all relative flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md active:scale-98 group',
                          inCartCount > 0
                            ? 'border-[#0D9488] ring-2 ring-brand-500/20 bg-[#F0FDFA]'
                            : 'border-[#E2E8F0] hover:border-[#99F6E4]',
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-black text-sm text-[#0F172A] group-hover:text-[#0D9488] transition-colors leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                            {inCartCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-[#0D9488] text-white font-black text-xs shadow-xs">
                                x{inCartCount}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-[#94A3B8] line-clamp-1 font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                          <span className="text-base font-black text-[#0D9488]">
                            ฿{Number(item.price).toLocaleString()}
                          </span>
                          <span className="p-1 rounded-xl bg-[#F8FAFC] group-hover:bg-[#0D9488] group-hover:text-white text-[#475569] transition-colors">
                            <Plus className="w-4 h-4" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="w-full lg:w-[380px] bg-white flex flex-col h-full shrink-0 shadow-lg border-l border-[#E2E8F0]">
            {/* Dine-in vs Takeaway Toggle */}
            <div className="p-4 border-b border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-[#0F172A]">รายการในบิล ({totalCount})</h3>
                {!isCartEmpty && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs font-bold text-[#DC2626] hover:text-red-700 p-1 rounded-lg hover:bg-rose-50 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้าง</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setOrderType(OrderType.DINE_IN)}
                  className={clsx(
                    'py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                    orderType === OrderType.DINE_IN
                      ? 'bg-white text-[#0D9488] shadow-2xs border border-[#E2E8F0]'
                      : 'text-[#475569] hover:text-[#0F172A]',
                  )}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>ทานที่ร้าน</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType(OrderType.TAKEAWAY)}
                  className={clsx(
                    'py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                    orderType === OrderType.TAKEAWAY
                      ? 'bg-white text-[#0D9488] shadow-2xs border border-[#E2E8F0]'
                      : 'text-[#475569] hover:text-[#0F172A]',
                  )}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>สั่งกลับบ้าน</span>
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isCartEmpty ? (
                <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] py-12 text-center">
                  <ShoppingBag className="w-10 h-10 opacity-30 mb-2" />
                  <p className="text-sm font-bold text-[#475569]">ยังไม่มีรายการ</p>
                  <p className="text-xs text-[#94A3B8]">แตะเลือกเมนูจากด้านซ้าย</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-[#0F172A] text-xs">{item.menuItem.name}</h4>
                        {item.options && (
                          <p className="text-[11px] text-[#0D9488] font-medium">
                            {Object.entries(item.options)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </p>
                        )}
                        {item.customNote && (
                          <p className="text-[11px] text-[#D97706] italic">
                            โน้ต: {item.customNote}
                          </p>
                        )}
                      </div>
                      <span className="font-black text-[#0F172A] text-xs shrink-0">
                        ฿{item.subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                      <span className="text-[11px] text-[#475569] font-medium">
                        ฿{item.unitPrice} / ชิ้น
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleRemoveItem(item.id);
                            } else {
                              handleUpdateQuantity(item.id, -1);
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-black text-xs text-[#0F172A]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-rose-50 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Footer & Quick Checkout Actions */}
            <div className="p-4 border-t border-[#E2E8F0] bg-white space-y-3 shrink-0">
              {/* Quick Note Pills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#475569]">
                  <span>โน้ตบิล (แตะเลือกด่วน)</span>
                  {orderNote && (
                    <button
                      type="button"
                      onClick={() => setOrderNote('')}
                      className="text-[#DC2626] hover:text-red-700 font-bold"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {['ไม่ใส่ผัก', 'แยกน้ำ/ซุป', 'ขอน้ำปลาพริก', 'ขอช้อนส้อม', 'น้ำมันน้อย', 'ไม่ใส่ชูรส'].map(
                    (quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => {
                          if (orderNote.includes(quick)) {
                            setOrderNote((prev) =>
                              prev
                                .replace(quick, '')
                                .replace(/,\s*,/g, ',')
                                .replace(/^,\s*|,\s*$/g, '')
                                .trim(),
                            );
                          } else {
                            setOrderNote((prev) => (prev ? `${prev}, ${quick}` : quick));
                          }
                        }}
                        className={clsx(
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95',
                          orderNote.includes(quick)
                            ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-2xs'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100',
                        )}
                      >
                        {quick}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Order Note Input */}
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="พิมพ์โน้ตเพิ่มเติม (ถ้ามี)..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-brand-600"
                />
              </div>

              {/* Total Price */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="font-black text-[#0F172A] text-sm">ยอดชำระสุทธิ</span>
                <span className="font-black text-[#0D9488] text-2xl">
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Checkout Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* Cash Payment */}
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(true)}
                  disabled={isCartEmpty || isSubmitting}
                  className="py-3.5 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Banknote className="w-4 h-4" />
                  <span>รับเงินสด 💵</span>
                </button>

                {/* Sunmi V2 QR Code Push */}
                <button
                  type="button"
                  onClick={handleTriggerQrPayment}
                  disabled={isCartEmpty || isSubmitting}
                  className="py-3.5 px-3 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-md shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>สแกน QR (Sunmi) 📱</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Modifier Modal */}
      <PosItemModifierModal
        item={selectedMenuItem}
        isOpen={!!selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
        onConfirm={handleConfirmModifier}
      />

      {/* Cash Modal */}
      <PosCashModal
        isOpen={isCashModalOpen}
        totalPrice={totalPrice}
        onClose={() => setIsCashModalOpen(false)}
        onConfirm={handleTriggerCashPayment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
