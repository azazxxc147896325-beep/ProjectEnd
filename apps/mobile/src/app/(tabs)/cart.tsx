import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { mobileApi } from '../../lib/api';
import { Order, OrderType } from '@campus-food/shared-types';
import {
  CartEmptyState,
  CartVendorHeader,
  CartOrderTypeSelector,
  CartItemRow,
  CartNoteInput,
  CartSummaryCard,
} from '../../components/cart';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    vendorId,
    vendorName,
    orderType,
    note,
    updateQuantity,
    setOrderType,
    setNote,
    clearCart,
    getTotalPrice,
  } = useCartStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (!vendorId || items.length === 0) {
      Alert.alert('ตะกร้าว่างเปล่า', 'กรุณาเลือกรายการอาหารก่อนสั่งซื้อครับ');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'กรุณาเข้าสู่ระบบ 🔐',
        'คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบนักศึกษาเพื่อยืนยันออเดอร์และรับหมายเลขคิวอาหารครับ',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'เข้าสู่ระบบทันที',
            onPress: () => router.push('/login'),
          },
        ],
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        vendorId,
        orderType,
        note: note.trim() || undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          options: i.options,
        })),
      };

      const createdOrder = await mobileApi<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      clearCart();
      Alert.alert(
        'สั่งอาหารสำเร็จ! 🎉',
        `หมายเลขคิวของคุณคือ #${createdOrder.queueNumber}\nกำลังพาคุณไปหน้าติดตามสถานะอาหาร`,
        [
          {
            text: 'ติดตามคิวทันที',
            onPress: () => router.push(`/order/${createdOrder.id}`),
          },
        ],
      );
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('401')) {
        Alert.alert(
          'เข้าสู่ระบบหมดอายุ 🔐',
          'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อสั่งอาหารครับ',
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'เข้าสู่ระบบ',
              onPress: () => router.push('/login'),
            },
          ],
        );
      } else {
        Alert.alert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <CartEmptyState onBrowseVendors={() => router.push('/(tabs)')} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Auth Notice Banner if not logged in */}
        {!isAuthenticated && (
          <TouchableOpacity
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(249, 115, 22, 0.4)',
              borderRadius: 16,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Text style={{ fontSize: 16 }}>🔐</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: 'bold' }}>
                  ยังไม่ได้เข้าสู่ระบบ
                </Text>
                <Text style={{ color: '#fb923c', fontSize: 11 }}>
                  แตะเพื่อเข้าสู่ระบบนักศึกษาสำหรับสั่งอาหารและรับคิว
                </Text>
              </View>
            </View>
            <Text style={{ color: '#f97316', fontSize: 12, fontWeight: 'bold' }}>เข้าสู่ระบบ ›</Text>
          </TouchableOpacity>
        )}

        {/* Vendor Header Subcomponent */}
        <CartVendorHeader vendorName={vendorName || 'ร้านค้า'} />

        {/* Order Type Selector Subcomponent */}
        <CartOrderTypeSelector
          orderType={orderType}
          onSelectOrderType={setOrderType}
        />

        {/* Item List */}
        <View
          style={{
            backgroundColor: '#0f172a',
            borderRadius: 20,
            padding: 14,
            borderWidth: 1,
            borderColor: '#1e293b',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
            รายการอาหารในตะกร้า ({items.length})
          </Text>

          {items.map((item, idx) => (
            <CartItemRow
              key={item.menuItem.id}
              item={item}
              isFirst={idx === 0}
              onUpdateQuantity={(itemId, delta) => updateQuantity(itemId, delta)}
            />
          ))}
        </View>

        {/* Note / Special Instructions Input Subcomponent */}
        <CartNoteInput note={note} onNoteChange={setNote} />

        {/* Payment Summary & Checkout Button Subcomponent */}
        <CartSummaryCard
          totalPrice={totalPrice}
          isSubmitting={isSubmitting}
          onCheckout={handleCheckout}
        />
      </ScrollView>
    </View>
  );
}
