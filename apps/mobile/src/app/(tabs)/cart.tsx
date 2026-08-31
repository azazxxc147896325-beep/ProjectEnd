import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore, VendorCartGroup } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { mobileApi } from '../../lib/api';
import { Order, PaymentMethod } from '@campus-food/shared-types';
import { Lock, ChevronRight, Store } from 'lucide-react-native';
import {
  CartEmptyState,
  CartVendorCard,
  CartVendorDetailView,
  CartSummaryCard,
  PromptPayQrModal,
} from '../../components/cart';
import { mobileToast } from '../../stores/toast-store';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    getVendorGroups,
    updateQuantity,
    setVendorOrderType,
    setVendorPaymentMethod,
    setVendorNote,
    clearVendor,
    clearCart,
    getTotalPrice,
    getTotalCount,
  } = useCartStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [submittingVendorId, setSubmittingVendorId] = useState<string | null>(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [activePromptPayOrder, setActivePromptPayOrder] = useState<Order | null>(null);

  const vendorGroups = getVendorGroups();
  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  // จัดการสั่งซื้อเฉพาะร้านค้าเดียว
  const handleCheckoutSingleVendor = async (group: VendorCartGroup) => {
    if (!isAuthenticated) {
      mobileToast.confirm({
        title: 'กรุณาเข้าสู่ระบบ',
        message: 'กรุณาเข้าสู่ระบบเพื่อยืนยันออเดอร์และรับหมายเลขคิวอาหารครับ',
        confirmText: 'เข้าสู่ระบบ',
        cancelText: 'ภายหลัง',
        onConfirm: () => router.push('/login'),
      });
      return;
    }

    if (group.items.length === 0) {
      mobileToast.warning('ไม่มีรายการอาหาร', 'ร้านนี้ไม่มีรายการอาหารในตะกร้า');
      return;
    }

    try {
      setSubmittingVendorId(group.vendorId);
      const payload = {
        vendorId: group.vendorId,
        orderType: group.orderType,
        paymentMethod: group.paymentMethod || PaymentMethod.PROMPTPAY,
        note: group.note?.trim() || undefined,
        items: group.items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          options: i.options,
        })),
      };

      const createdOrder = await mobileApi<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // ลบเฉพาะรายการของร้านนี้ออกจากตะกร้า
      clearVendor(group.vendorId);
      setSelectedVendorId(null);

      // หากเลือกพร้อมเพย์ QR ให้เปิด QR Modal สแกนจ่าย
      if (group.paymentMethod === PaymentMethod.PROMPTPAY) {
        setActivePromptPayOrder(createdOrder);
      } else {
        mobileToast.success(
          `สั่งร้าน "${group.vendorName}" สำเร็จ! คิว #${createdOrder.queueNumber}`,
          'ชำระเงินสดที่เคาน์เตอร์ตอนไปรับอาหารครับ'
        );
        router.push(`/order/${createdOrder.id}`);
      }
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('401')) {
        mobileToast.confirm({
          title: 'เซสชันหมดอายุ',
          message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อสั่งอาหารครับ',
          confirmText: 'เข้าสู่ระบบ',
          cancelText: 'ปิด',
          onConfirm: () => router.push('/login'),
        });
      } else {
        mobileToast.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setSubmittingVendorId(null);
    }
  };

  // จัดการสั่งซื้อทุกร้านค้าพร้อมกัน
  const handleCheckoutAll = async () => {
    if (vendorGroups.length === 0) {
      mobileToast.warning('ตะกร้าว่างเปล่า', 'กรุณาเลือกรายการอาหารก่อนสั่งซื้อครับ');
      return;
    }

    if (!isAuthenticated) {
      mobileToast.confirm({
        title: 'กรุณาเข้าสู่ระบบ',
        message: 'กรุณาเข้าสู่ระบบเพื่อยืนยันออเดอร์และรับหมายเลขคิวอาหารครับ',
        confirmText: 'เข้าสู่ระบบ',
        cancelText: 'ภายหลัง',
        onConfirm: () => router.push('/login'),
      });
      return;
    }

    try {
      setIsSubmittingAll(true);
      const createdOrders: Order[] = [];

      for (const group of vendorGroups) {
        const payload = {
          vendorId: group.vendorId,
          orderType: group.orderType,
          note: group.note?.trim() || undefined,
          items: group.items.map((i) => ({
            menuItemId: i.menuItem.id,
            quantity: i.quantity,
            options: i.options,
          })),
        };

        const created = await mobileApi<Order>('/orders', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        createdOrders.push(created);
      }

      clearCart();
      setSelectedVendorId(null);

      const queueList = createdOrders.map((o) => `#${o.queueNumber}`).join(', ');
      mobileToast.success(
        `สั่งอาหารสำเร็จ ${createdOrders.length} ร้าน! คิว (${queueList})`,
        'ระบบส่งออเดอร์ไปยังทุกร้านค้าเรียบร้อยแล้ว'
      );

      if (createdOrders.length === 1) {
        router.push(`/order/${createdOrders[0].id}`);
      } else {
        router.push('/(tabs)/orders');
      }
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('401')) {
        mobileToast.confirm({
          title: 'เซสชันหมดอายุ',
          message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อสั่งอาหารครับ',
          confirmText: 'เข้าสู่ระบบ',
          cancelText: 'ปิด',
          onConfirm: () => router.push('/login'),
        });
      } else {
        mobileToast.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmittingAll(false);
    }
  };

  // หากตะกร้าว่างเปล่า
  if (items.length === 0 || vendorGroups.length === 0) {
    return <CartEmptyState onBrowseVendors={() => router.push('/(tabs)')} />;
  }

  // หากผู้ใช้เลือกกดเข้าไปดูรายละเอียดของร้านใดร้านหนึ่ง
  if (selectedVendorId) {
    const selectedGroup = vendorGroups.find((g) => g.vendorId === selectedVendorId);
    if (selectedGroup) {
      return (
        <>
          <CartVendorDetailView
            group={selectedGroup}
            isSubmitting={submittingVendorId === selectedGroup.vendorId}
            onBack={() => setSelectedVendorId(null)}
            onUpdateQuantity={updateQuantity}
            onSelectOrderType={setVendorOrderType}
            onSelectPaymentMethod={setVendorPaymentMethod}
            onNoteChange={setVendorNote}
            onClearVendor={(vId) => {
              clearVendor(vId);
              setSelectedVendorId(null);
            }}
            onCheckout={handleCheckoutSingleVendor}
          />

          <PromptPayQrModal
            order={activePromptPayOrder}
            visible={!!activePromptPayOrder}
            onSuccess={(updatedOrder) => {
              const orderId = activePromptPayOrder?.id;
              setActivePromptPayOrder(null);
              if (orderId) {
                router.push(`/order/${orderId}`);
              }
            }}
            onClose={() => {
              const orderId = activePromptPayOrder?.id;
              setActivePromptPayOrder(null);
              if (orderId) {
                router.push(`/order/${orderId}`);
              }
            }}
          />
        </>
      );
    }
  }

  // หน้าหลักของตะกร้า: แสดงรายการการ์ดร้านค้าทั้งหมด + ปุ่มสั่งพร้อมกัน
  return (
    <View style={{ flex: 1, backgroundColor: '#F0F7FF' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Auth Notice Banner if not logged in */}
        {!isAuthenticated && (
          <TouchableOpacity
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#E0F2FE',
              borderWidth: 1,
              borderColor: '#BAE6FD',
              borderRadius: 16,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Lock size={18} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#0F172A', fontSize: 12, fontWeight: 'bold' }}>
                  ยังไม่ได้เข้าสู่ระบบ
                </Text>
                <Text style={{ color: '#0369A1', fontSize: 11 }}>
                  แตะเพื่อเข้าสู่ระบบนักศึกษาสำหรับสั่งอาหารและรับคิว
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#0284C7" />
          </TouchableOpacity>
        )}

        {/* Multi-vendor Header Banner */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            gap: 12,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#E0F2FE',
              borderWidth: 1,
              borderColor: '#BAE6FD',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Store size={20} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold' }}>
              ร้านค้าในตะกร้า ({vendorGroups.length} ร้าน)
            </Text>
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
              แตะที่การ์ดร้านค้าเพื่อดูรายการ หรือกดสั่งพร้อมกันทั้งหมดด้านล่าง
            </Text>
          </View>
        </View>

        {/* Render Store Cards list */}
        {vendorGroups.map((group) => (
          <CartVendorCard
            key={group.vendorId}
            group={group}
            onPress={() => setSelectedVendorId(group.vendorId)}
            onClearVendor={clearVendor}
          />
        ))}

        {/* Total Summary Card & Sticky Bottom Checkout All Button */}
        <CartSummaryCard
          totalPrice={totalPrice}
          totalCount={totalCount}
          vendorCount={vendorGroups.length}
          isSubmitting={isSubmittingAll}
          onCheckout={handleCheckoutAll}
        />
      </ScrollView>

      <PromptPayQrModal
        order={activePromptPayOrder}
        visible={!!activePromptPayOrder}
        onSuccess={(updatedOrder) => {
          const orderId = activePromptPayOrder?.id;
          setActivePromptPayOrder(null);
          if (orderId) {
            router.push(`/order/${orderId}`);
          }
        }}
        onClose={() => {
          const orderId = activePromptPayOrder?.id;
          setActivePromptPayOrder(null);
          if (orderId) {
            router.push(`/order/${orderId}`);
          }
        }}
      />
    </View>
  );
}
