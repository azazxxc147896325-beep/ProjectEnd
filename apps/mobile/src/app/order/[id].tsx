import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { getMobileSocket } from '../../lib/socket';
import { sendLocalNotification } from '../../lib/notifications';
import { Order, OrderStatus, WsEvents } from '@campus-food/shared-types';
import { ChevronLeft } from 'lucide-react-native';
import { mobileToast } from '../../stores/toast-store';
import {
  OrderCancelledBanner,
  OrderReadyCard,
  OrderTrackingSteps,
  OrderSummaryCard,
  OrderActionButtons,
} from '../../components/order';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      if (!id) return;
      const data = await mobileApi<Order>(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.log('Error fetching order details:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    mobileToast.confirm({
      title: 'ยกเลิกคำสั่งซื้อ',
      message: 'คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่? (สามารถยกเลิกได้ก่อนร้านเริ่มปรุงอาหาร)',
      confirmText: 'ยืนยันยกเลิก',
      cancelText: 'ไม่ยกเลิก',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setIsCancelling(true);
          const updated = await mobileApi<Order>(`/orders/${id}/cancel`, {
            method: 'PATCH',
            body: JSON.stringify({ reason: 'ผู้สั่งขอยกเลิกคำสั่งซื้อ' }),
          });
          setOrder(updated);
          mobileToast.success('ยกเลิกสำเร็จ', 'คำสั่งซื้อของคุณถูกยกเลิกและบันทึกในประวัติแล้ว');
        } catch (err: any) {
          mobileToast.error('ไม่สามารถยกเลิกได้', err?.message || 'ร้านค้าอาจเริ่มปรุงอาหารแล้ว กรุณาติดต่อหน้าร้าน');
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  const handleConfirmReceipt = () => {
    mobileToast.confirm({
      title: 'ยืนยันการรับอาหาร',
      message: 'คุณได้รับอาหารจากร้านค้าครบถ้วนเรียบร้อยแล้วใช่หรือไม่?',
      confirmText: 'ได้รับอาหารแล้ว',
      cancelText: 'ยังไม่ได้รับ',
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          const updated = await mobileApi<Order>(`/orders/${id}/confirm-receipt`, {
            method: 'PATCH',
          });
          setOrder(updated);
          mobileToast.success(
            'บันทึกสำเร็จ! 🍽️',
            'ขอให้อร่อยกับมื้ออาหารนะครับ'
          );
          setTimeout(() => {
            router.replace('/(tabs)/orders');
          }, 1500);
        } catch (err: any) {
          mobileToast.error('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถยืนยันการรับอาหารได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
          setIsConfirming(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchOrder();

    if (!id) return;
    const socket = getMobileSocket();

    // Join Live Order Room
    socket.emit(WsEvents.JOIN_ORDER_ROOM, { orderId: id });

    const handleStatusUpdate = (payload: { order: Order; newStatus: OrderStatus }) => {
      console.log('[Socket] Order Status Updated via WS:', payload);
      setOrder(payload.order);

      if (payload.newStatus === OrderStatus.READY) {
        sendLocalNotification(
          'อาหารของคุณพร้อมรับแล้ว',
          `คิว #${payload.order.queueNumber} จากร้านค้าเสร็จเรียบร้อยแล้ว กรุณาไปรับที่หน้าร้านได้เลยครับ`,
          { orderId: id },
        );
      }
    };

    const handleOrderReady = (payload: { order: Order }) => {
      console.log('[Socket] ORDER READY RECEIVED:', payload);
      setOrder(payload.order);
      sendLocalNotification(
        'อาหารของคุณพร้อมรับแล้ว',
        `คิว #${payload.order.queueNumber} จากร้านค้าเสร็จเรียบร้อยแล้ว กรุณาไปรับที่หน้าร้านได้เลยครับ`,
        { orderId: id },
      );
    };

    socket.on(WsEvents.ORDER_STATUS_UPDATED, handleStatusUpdate);
    socket.on(WsEvents.ORDER_READY, handleOrderReady);

    return () => {
      socket.emit(WsEvents.LEAVE_ORDER_ROOM, { orderId: id });
      socket.off(WsEvents.ORDER_STATUS_UPDATED, handleStatusUpdate);
      socket.off(WsEvents.ORDER_READY, handleOrderReady);
    };
  }, [id]);

  if (loading || !order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A110E' }}>
        <ActivityIndicator size="large" color="#8FBC7A" />
        <Text style={{ color: '#88A096', fontSize: 12, marginTop: 8 }}>กำลังโหลดสถานะออเดอร์...</Text>
      </View>
    );
  }

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/orders');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A110E' }}>
      <Stack.Screen
        options={{
          title: `คิว #${order.queueNumber} (${order.vendor?.name || 'ร้านค้า'})`,
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleGoBack}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 6,
                paddingRight: 12,
              }}
            >
              <ChevronLeft size={22} color="#F8FAFC" />
              <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' }}>ย้อนกลับ</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/orders')}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 10,
                backgroundColor: '#162720',
                borderWidth: 1,
                borderColor: '#244034',
              }}
            >
              <Text style={{ color: '#8FBC7A', fontSize: 12, fontWeight: 'bold' }}>ออเดอร์</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Cancelled Banner Card */}
        {order.status === OrderStatus.CANCELLED && (
          <OrderCancelledBanner
            order={order}
            onViewHistory={() => router.replace('/(tabs)/orders')}
          />
        )}

        {/* Queue Banner Card (When Not Cancelled) */}
        {order.status !== OrderStatus.CANCELLED && (
          <OrderReadyCard order={order} />
        )}

        {/* Real-time Step Progress Timeline */}
        <OrderTrackingSteps status={order.status as OrderStatus} />

        {/* Order Details Summary */}
        <OrderSummaryCard order={order} />

        {/* Action Button Section: Pending Cancel / Ready Confirm Receipt / Completed */}
        <OrderActionButtons
          order={order}
          onCancel={handleCancelOrder}
          onConfirmReceipt={handleConfirmReceipt}
          onViewAllOrders={() => router.replace('/(tabs)/orders')}
          isCancelling={isCancelling}
          isConfirming={isConfirming}
        />
      </ScrollView>
    </View>
  );
}
