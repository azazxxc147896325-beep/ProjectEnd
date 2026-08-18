import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { mobileApi } from '../../lib/api';
import { Order, OrderType, OrderStatus } from '@campus-food/shared-types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Package,
  MessageSquare,
  ArrowRight,
  Store,
} from 'lucide-react-native';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    vendorId,
    vendorName,
    orderType,
    note,
    updateQuantity,
    removeItem,
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
    return (
      <View style={{ flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#1e293b',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <ShoppingBag size={36} color="#64748b" />
        </View>
        <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold' }}>ไม่มีสินค้าในตะกร้า</Text>
        <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
          เลือกดูเมนูอร่อยๆ จากร้านค้าในโรงอาหาร แล้วกดสั่งอาหารได้เลยครับ
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={{
            marginTop: 24,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: '#f97316',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>ไปเลือกร้านอาหาร</Text>
        </TouchableOpacity>
      </View>
    );
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

        {/* Vendor Header */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: '#1e293b',
            marginBottom: 16,
            gap: 10,
          }}
        >
          <Store size={20} color="#f97316" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>สั่งอาหารจากร้าน</Text>
            <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold' }}>{vendorName}</Text>
          </View>
        </View>

        {/* Order Type Selector (ทานที่ร้าน vs ใส่ห่อกลับ) */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            เลือกรูปแบบการรับประทาน *
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setOrderType(OrderType.DINE_IN)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: orderType === OrderType.DINE_IN ? '#f97316' : '#0f172a',
                borderWidth: 1,
                borderColor: orderType === OrderType.DINE_IN ? '#f97316' : '#1e293b',
              }}
            >
              <Utensils size={16} color={orderType === OrderType.DINE_IN ? '#ffffff' : '#94a3b8'} />
              <Text
                style={{
                  color: orderType === OrderType.DINE_IN ? '#ffffff' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 'bold',
                }}
              >
                🍽️ ทานที่ร้าน
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOrderType(OrderType.TAKEAWAY)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: orderType === OrderType.TAKEAWAY ? '#f97316' : '#0f172a',
                borderWidth: 1,
                borderColor: orderType === OrderType.TAKEAWAY ? '#f97316' : '#1e293b',
              }}
            >
              <Package size={16} color={orderType === OrderType.TAKEAWAY ? '#ffffff' : '#94a3b8'} />
              <Text
                style={{
                  color: orderType === OrderType.TAKEAWAY ? '#ffffff' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 'bold',
                }}
              >
                🛍️ กลับบ้าน
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item List */}
        <View style={{ backgroundColor: '#0f172a', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 }}>
          <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
            รายการอาหารในตะกร้า ({items.length})
          </Text>

          {items.map((item, idx) => (
            <View
              key={item.menuItem.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderTopWidth: idx > 0 ? 1 : 0,
                borderColor: '#1e293b',
              }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>
                  {item.menuItem.name}
                </Text>
                <Text style={{ color: '#f97316', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  ฿{Number(item.menuItem.price)} / จาน
                </Text>
              </View>

              {/* Quantity Controls */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.menuItem.id, -1)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: '#1e293b',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Minus size={14} color="#f8fafc" />
                </TouchableOpacity>

                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold', minWidth: 16, textAlign: 'center' }}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => updateQuantity(item.menuItem.id, 1)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: '#f97316',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Plus size={14} color="#ffffff" />
                </TouchableOpacity>

                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold', width: 55, textAlign: 'right' }}>
                  ฿{item.subtotal}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Note / Special Instructions Input */}
        <View style={{ backgroundColor: '#0f172a', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <MessageSquare size={14} color="#f97316" />
            <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>
              ข้อความระบุเพิ่มเติมถึงแม่ค้า
            </Text>
          </View>

          <TextInput
            placeholder="เช่น เผ็ดน้อย, ไม่ใส่ผักชี, ขอน้ำซุปเพิ่ม..."
            placeholderTextColor="#64748b"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: 10,
              color: '#f8fafc',
              fontSize: 12,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          />
        </View>

        {/* Payment Summary */}
        <View style={{ backgroundColor: '#0f172a', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#1e293b' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>ยอดรวมค่าอาหาร</Text>
            <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>฿{totalPrice}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>ค่าบริการระบบ</Text>
            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>ฟรี (0 บาท)</Text>
          </View>
          <View style={{ borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold' }}>ยอดชำระสุทธิ</Text>
            <Text style={{ color: '#f97316', fontSize: 18, fontWeight: 'bold' }}>฿{totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Checkout Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: '#0f172a',
          borderRadius: 22,
          padding: 12,
          borderWidth: 1,
          borderColor: '#1e293b',
        }}
      >
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#f97316',
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                ยืนยันการสั่งซื้อ (฿{totalPrice})
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
