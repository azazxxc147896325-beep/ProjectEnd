import React, { useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';
import { mobileToast } from '../../stores/toast-store';
import { Order, OrderStatus } from '@campus-food/shared-types';
import {
  OrderHistoryTabs,
  OrderHistoryEmptyState,
  OrderReviewModal,
  OrderHistoryCard,
} from '../../components/orders';

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
      const res = await mobileApi<any>(`/orders/student/${user.id}`);
      const orderList = Array.isArray(res) ? res : res?.data || [];
      setOrders(orderList);
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

  const safeOrders = Array.isArray(orders) ? orders : [];

  const activeOrders = safeOrders.filter(
    (o) => o && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED,
  );
  const pastOrders = safeOrders.filter(
    (o) => o && (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED),
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = (order: Order) => {
    if (!order.vendor || !order.items) return;
    for (const item of order.items) {
      if (item.menuItem) {
        addItem({ id: order.vendor.id, name: order.vendor.name }, item.menuItem, item.quantity);
      }
    }
    mobileToast.success('เพิ่มรายการเดิมลงในตะกร้าแล้ว 🛍️', 'แตะที่แท็บตะกร้าเพื่อตรวจสอบออเดอร์');
  };

  const handleOpenReview = (order: Order) => {
    setReviewOrder(order);
    setRating(5);
    setReviewComment('');
    setIsReviewOpen(true);
  };

  const handleSubmitReview = () => {
    mobileToast.success('ขอบคุณสำหรับรีวิว! ⭐', 'ความคิดเห็นของคุณช่วยให้ร้านค้าพัฒนาอาหารให้อร่อยยิ่งขึ้นครับ');
    setIsReviewOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0FDFA' }}>
      {/* Top Tabs Bar Subcomponent */}
      <OrderHistoryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeOrders.length}
        historyCount={pastOrders.length}
      />

      {/* Orders List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
          ListEmptyComponent={<OrderHistoryEmptyState activeTab={activeTab} />}
          renderItem={({ item }) => (
            <OrderHistoryCard
              order={item}
              activeTab={activeTab}
              onPressCard={(orderId) => router.push(`/order/${orderId}`)}
              onOpenReview={handleOpenReview}
              onReorder={handleReorder}
            />
          )}
        />
      )}

      {/* Review Modal Subcomponent */}
      <OrderReviewModal
        isOpen={isReviewOpen}
        order={reviewOrder}
        rating={rating}
        onRatingChange={setRating}
        comment={reviewComment}
        onCommentChange={setReviewComment}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </View>
  );
}
