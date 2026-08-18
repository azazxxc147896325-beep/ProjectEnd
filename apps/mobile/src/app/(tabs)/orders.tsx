import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';
import { Order, OrderStatus, OrderType } from '@campus-food/shared-types';
import {
  Receipt,
  Clock,
  RotateCcw,
  Star,
  ChevronRight,
  Sparkles,
  X,
  Store,
} from 'lucide-react-native';

export default function OrdersHistoryScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { addItem } = useCartStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchOrders = async () => {
    try {
      if (!user?.id) {
        setOrders([]);
        return;
      }
      const data = await mobileApi<Order[]>(`/orders/student/${user.id}`);
      setOrders(data);
    } catch (err) {
      console.log('Error fetching student orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [user?.id]),
  );


  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const activeOrders = orders.filter(
    (o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED,
  );
  const pastOrders = orders.filter(
    (o) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED,
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = (order: Order) => {
    if (!order.vendor || !order.items) return;
    for (const item of order.items) {
      if (item.menuItem) {
        addItem({ id: order.vendor.id, name: order.vendor.name }, item.menuItem, item.quantity);
      }
    }
    Alert.alert('เพิ่มรายการลงตะกร้าแล้ว', 'นำรายการเดิมใส่ตะกร้าเรียบร้อยแล้วครับ', [
      { text: 'ไปที่ตะกร้า', onPress: () => router.push('/(tabs)/cart') },
      { text: 'ตกลง' },
    ]);
  };

  const handleOpenReview = (order: Order) => {
    setReviewOrder(order);
    setRating(5);
    setReviewComment('');
    setIsReviewOpen(true);
  };

  const handleSubmitReview = () => {
    Alert.alert('ขอบคุณสำหรับรีวิว! ⭐', 'ความคิดเห็นของคุณช่วยให้ร้านค้าพัฒนาอาหารให้อร่อยยิ่งขึ้นครับ');
    setIsReviewOpen(false);
  };

  const formatDateTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      {/* Top Tabs Bar */}
      <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', padding: 8, borderBottomWidth: 1, borderColor: '#1e293b' }}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: activeTab === 'active' ? '#f97316' : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: activeTab === 'active' ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            🔥 กำลังดำเนินการ ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: activeTab === 'history' ? '#f97316' : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: activeTab === 'history' ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            📜 ประวัติคำสั่งซื้อ ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Receipt size={40} color="#334155" />
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>
                {activeTab === 'active' ? 'ไม่มีออเดอร์ที่กำลังดำเนินการ' : 'ยังไม่มีประวัติคำสั่งซื้อ'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: '#1e293b',
              }}
            >
              {/* Header: Queue + Vendor + Status Badge */}
              <TouchableOpacity
                onPress={() => router.push(`/order/${item.id}`)}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#1e293b', paddingBottom: 10 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 10,
                      backgroundColor:
                        item.status === OrderStatus.CANCELLED
                          ? 'rgba(239, 68, 68, 0.2)'
                          : item.status === OrderStatus.COMPLETED
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(249, 115, 22, 0.2)',
                    }}
                  >
                    <Text
                      style={{
                        color:
                          item.status === OrderStatus.CANCELLED
                            ? '#ef4444'
                            : item.status === OrderStatus.COMPLETED
                            ? '#10b981'
                            : '#f97316',
                        fontSize: 13,
                        fontWeight: '900',
                      }}
                    >
                      คิว #{item.queueNumber}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
                    {item.vendor?.name || 'ร้านค้า'}
                  </Text>
                </View>

                {item.status === OrderStatus.CANCELLED ? (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                    <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: 'bold' }}>
                      {item.cancelledBy === 'vendor' ? 'ร้านยกเลิก' : 'ยกเลิกแล้ว'}
                    </Text>
                  </View>
                ) : item.status === OrderStatus.COMPLETED ? (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                    <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>
                      เสร็จสมบูรณ์
                    </Text>
                  </View>
                ) : (
                  <ChevronRight size={18} color="#64748b" />
                )}
              </TouchableOpacity>

              {/* Items Preview & Cancel Reason */}
              <TouchableOpacity
                onPress={() => router.push(`/order/${item.id}`)}
                activeOpacity={0.8}
                style={{ marginVertical: 10 }}
              >
                <Text style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 18 }}>
                  {item.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || 'รายการ'}`).join(', ') ||
                    'รายการอาหาร'}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                  {formatDateTime(item.createdAt)} •{' '}
                  {item.orderType === OrderType.DINE_IN ? '🍽️ ทานที่ร้าน' : '🛍️ กลับบ้าน'}
                </Text>

                {item.status === OrderStatus.CANCELLED && (
                  <View style={{ marginTop: 6, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <Text style={{ color: '#fca5a5', fontSize: 11 }}>
                      {item.cancelledBy === 'vendor' ? '⚠️ ร้านค้ายกเลิก: ' : '🛑 คุณยกเลิก: '}
                      {item.cancelReason || 'ไม่มีระบุสาเหตุ'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>


              {/* Footer: Price & Actions */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderColor: '#1e293b',
                }}
              >
                <Text style={{ color: '#f97316', fontSize: 15, fontWeight: 'bold' }}>
                  ฿{Number(item.totalPrice).toLocaleString()}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {activeTab === 'history' && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleOpenReview(item)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: '#1e293b',
                        }}
                      >
                        <Star size={12} color="#fbbf24" />
                        <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: 'bold' }}>รีวิว</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReorder(item)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: '#f97316',
                        }}
                      >
                        <RotateCcw size={12} color="#ffffff" />
                        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>สั่งซ้ำ</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {activeTab === 'active' && (
                    <TouchableOpacity
                      onPress={() => router.push(`/order/${item.id}`)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 10,
                        backgroundColor: '#f97316',
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>
                        ติดตามสถานะ
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Review Modal */}
      <Modal visible={isReviewOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#0f172a', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1e293b' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: 'bold' }}>ให้คะแนนและรีวิวอาหาร</Text>
              <TouchableOpacity onPress={() => setIsReviewOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 14 }}>
              {reviewOrder?.vendor?.name || 'ร้านค้า'} (คิว #{reviewOrder?.queueNumber})
            </Text>

            {/* Star Rating Selector */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star
                    size={32}
                    color={star <= rating ? '#fbbf24' : '#334155'}
                    fill={star <= rating ? '#fbbf24' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="เขียนความประทับใจ หรือข้อเสนอแนะเรื่องรสชาติ/ความรวดเร็ว..."
              placeholderTextColor="#64748b"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 14,
                padding: 12,
                color: '#f8fafc',
                fontSize: 12,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>ส่งรีวิว</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
