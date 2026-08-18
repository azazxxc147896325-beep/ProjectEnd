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
import { Order, OrderStatus, OrderType, WsEvents } from '@campus-food/shared-types';
import {
  Clock,
  Flame,
  CheckCircle2,
  BellRing,
  Store,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  XCircle,
  AlertTriangle,
  Ban,
} from 'lucide-react-native';

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
    Alert.alert(
      'ยกเลิกคำสั่งซื้อ ❌',
      'คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่? (สามารถยกเลิกได้ก่อนร้านเริ่มปรุงอาหาร)',
      [
        { text: 'ไม่ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยันยกเลิก',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              const updated = await mobileApi<Order>(`/orders/${id}/cancel`, {
                method: 'PATCH',
                body: JSON.stringify({ reason: 'ผู้สั่งขอยกเลิกคำสั่งซื้อ' }),
              });
              setOrder(updated);
              Alert.alert('ยกเลิกสำเร็จ', 'คำสั่งซื้อของคุณถูกยกเลิกและบันทึกในประวัติแล้ว');
            } catch (err: any) {
              Alert.alert('ไม่สามารถยกเลิกได้', err?.message || 'ร้านค้าอาจเริ่มปรุงอาหารแล้ว กรุณาติดต่อหน้าร้าน');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };


  const handleConfirmReceipt = () => {
    Alert.alert(
      'ยืนยันการรับอาหาร 🍱',
      'คุณได้รับอาหารจากร้านค้าครบถ้วนเรียบร้อยแล้วใช่หรือไม่?',
      [
        { text: 'ยังไม่ได้รับ', style: 'cancel' },
        {
          text: 'ได้รับอาหารแล้ว',
          style: 'default',
          onPress: async () => {
            try {
              setIsConfirming(true);
              const updated = await mobileApi<Order>(`/orders/${id}/confirm-receipt`, {
                method: 'PATCH',
              });
              setOrder(updated);
              Alert.alert(
                'บันทึกสำเร็จ! 🎉',
                'ออเดอร์ถูกย้ายไปยังประวัติการสั่งซื้อเรียบร้อยแล้ว ขอให้อร่อยกับมื้ออาหารนะครับ! 😋',
                [
                  {
                    text: 'ดูประวัติการสั่งซื้อ',
                    onPress: () => router.replace('/(tabs)/orders'),
                  },
                ],
              );
            } catch (err: any) {
              Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถยืนยันการรับอาหารได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
              setIsConfirming(false);
            }
          },
        },
      ],
    );
  };



  useEffect(() => {
    fetchOrder();

    if (!id) return;
    const socket = getMobileSocket();

    // Join Live Order Room
    socket.emit(WsEvents.JOIN_ORDER_ROOM, { orderId: id });

    const handleStatusUpdate = (payload: { order: Order; newStatus: OrderStatus }) => {
      console.log('⚡ Order Status Updated via WS:', payload);
      setOrder(payload.order);

      if (payload.newStatus === OrderStatus.READY) {
        sendLocalNotification(
          'อาหารของคุณพร้อมรับแล้ว! 🍱🎉',
          `คิว #${payload.order.queueNumber} จากร้านค้าเสร็จเรียบร้อยแล้ว กรุณาไปรับที่หน้าร้านได้เลยครับ`,
          { orderId: id },
        );
      }
    };

    const handleOrderReady = (payload: { order: Order }) => {
      console.log('⚡ ORDER READY RECEIVED:', payload);
      setOrder(payload.order);
      sendLocalNotification(
        'อาหารของคุณพร้อมรับแล้ว! 🍱🎉',
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090d16' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>กำลังโหลดสถานะออเดอร์...</Text>
      </View>
    );
  }

  // Steps Definition
  const steps = [
    {
      status: OrderStatus.PENDING,
      title: 'รอร้านรับออเดอร์',
      desc: 'คำสั่งซื้อถูกส่งไปยังร้านค้าแล้ว',
      icon: Clock,
    },
    {
      status: OrderStatus.COOKING,
      title: 'กำลังปรุงอาหาร',
      desc: 'พ่อครัว/แม่ค้ากำลังปรุงอาหารตามคิวของคุณ',
      icon: Flame,
    },
    {
      status: OrderStatus.READY,
      title: 'อาหารพร้อมรับแล้ว! 🎉',
      desc: 'อาหารทำเสร็จแล้ว กรุณาไปรับที่เคาน์เตอร์หน้าร้าน',
      icon: BellRing,
    },
    {
      status: OrderStatus.COMPLETED,
      title: 'รับประทานให้อร่อย',
      desc: 'ออเดอร์เสร็จสมบูรณ์เรียบร้อย',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
      case OrderStatus.ACCEPTED:
        return 0;
      case OrderStatus.COOKING:
        return 1;
      case OrderStatus.READY:
        return 2;
      case OrderStatus.COMPLETED:
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status as OrderStatus);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/orders');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
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
              <ChevronLeft size={22} color="#f8fafc" />
              <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>ย้อนกลับ</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/orders')}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 10,
                backgroundColor: '#1e293b',
              }}
            >
              <Text style={{ color: '#f97316', fontSize: 12, fontWeight: 'bold' }}>ออเดอร์</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Cancelled Banner Card */}
        {order.status === OrderStatus.CANCELLED && (
          <View
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderRadius: 24,
              padding: 20,
              borderWidth: 1.5,
              borderColor: '#ef4444',
              marginBottom: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Ban size={30} color="#ef4444" />
            </View>

            <Text style={{ color: '#ef4444', fontSize: 17, fontWeight: 'bold', marginBottom: 4 }}>
              {order.cancelledBy === 'vendor' ? '⚠️ ร้านค้ายกเลิกคำสั่งซื้อนี้' : '🛑 คุณได้ยกเลิกคำสั่งซื้อนี้แล้ว'}
            </Text>

            <Text style={{ color: '#cbd5e1', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              สาเหตุ: {order.cancelReason || (order.cancelledBy === 'vendor' ? 'ร้านค้าไม่สะดวกรับออเดอร์ หรือวัตถุดิบหมด' : 'ผู้สั่งขอยกเลิกออเดอร์')}
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/orders')}
              activeOpacity={0.85}
              style={{
                marginTop: 16,
                backgroundColor: '#1e293b',
                borderWidth: 1,
                borderColor: '#334155',
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: 'bold' }}>
                ดูประวัติคำสั่งซื้อทั้งหมด 📋
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Queue Banner Card (When Not Cancelled) */}
        {order.status !== OrderStatus.CANCELLED && (
          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: 24,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: order.status === OrderStatus.READY ? '#10b981' : '#f97316',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>หมายเลขคิวของคุณ</Text>
            <View
              style={{
                marginVertical: 10,
                width: 84,
                height: 84,
                borderRadius: 24,
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                borderWidth: 2,
                borderColor: order.status === OrderStatus.READY ? '#10b981' : '#f97316',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: order.status === OrderStatus.READY ? '#10b981' : '#f97316',
                  fontSize: 34,
                  fontWeight: '900',
                }}
              >
                #{order.queueNumber}
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 14,
                backgroundColor: order.status === OrderStatus.READY ? 'rgba(6, 78, 59, 0.8)' : '#1e293b',
              }}
            >
              <Text
                style={{
                  color: order.status === OrderStatus.READY ? '#6ee7b7' : '#f8fafc',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                {order.status === OrderStatus.READY
                  ? '🔔 อาหารพร้อมรับแล้ว!'
                  : order.status === OrderStatus.COOKING
                  ? '🔥 กำลังปรุงอาหารตามคิว'
                  : '⏳ กำลังรอร้านรับออเดอร์'}
              </Text>
            </View>
          </View>
        )}


        {/* Real-time Step Progress Timeline */}
        <View
          style={{
            backgroundColor: '#0f172a',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#1e293b',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 16 }}>
            สถานะการเตรียมอาหาร (Real-time)
          </Text>

          <View style={{ gap: 20 }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;

              return (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        backgroundColor: isCurrent
                          ? '#f97316'
                          : isPast
                          ? '#10b981'
                          : '#1e293b',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Icon size={18} color={isCurrent || isPast ? '#ffffff' : '#64748b'} />
                    </View>
                    {idx < steps.length - 1 && (
                      <View
                        style={{
                          width: 2,
                          height: 24,
                          backgroundColor: isPast ? '#10b981' : '#1e293b',
                          marginTop: 4,
                        }}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1, paddingTop: 4 }}>
                    <Text
                      style={{
                        color: isCurrent ? '#f97316' : isPast ? '#f8fafc' : '#64748b',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      {step.title}
                    </Text>
                    <Text style={{ color: isFuture ? '#475569' : '#94a3b8', fontSize: 12, marginTop: 2 }}>
                      {step.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Details Summary */}
        <View style={{ backgroundColor: '#0f172a', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 }}>
          <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
            รายละเอียดคำสั่งซื้อ
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>รูปแบบ</Text>
            <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>
              {order.orderType === OrderType.DINE_IN ? '🍽️ ทานที่ร้าน' : '🛍️ สั่งกลับบ้าน'}
            </Text>
          </View>

          {order.note && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>หมายเหตุ</Text>
              <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '600' }}>{order.note}</Text>
            </View>
          )}

          <View style={{ borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 8, marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>ยอดรวมทั้งหมด</Text>
            <Text style={{ color: '#f97316', fontSize: 16, fontWeight: 'bold' }}>
              ฿{Number(order.totalPrice).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Button Section: Pending Cancel / Ready Confirm Receipt / Completed */}
        {order.status === OrderStatus.PENDING && (
          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: '#334155',
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
              สามารถยกเลิกคำสั่งซื้อได้ก่อนที่ร้านค้าจะเริ่มปรุงอาหาร
            </Text>

            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={isCancelling}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 1,
                borderColor: '#ef4444',
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 20,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <XCircle size={16} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: 'bold' }}>
                    ยกเลิกคำสั่งซื้อนี้ ❌
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {order.status === OrderStatus.READY && (

          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderRadius: 24,
              padding: 18,
              borderWidth: 1.5,
              borderColor: '#10b981',
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#6ee7b7', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>
              🔔 พ่อค้า/แม่ค้าทำอาหารเสร็จแล้ว!
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
              กรุณาไปรับอาหารที่หน้าร้าน และกดยืนยันด้านล่างเพื่อย้ายเข้าสู่ประวัติการสั่งซื้อ
            </Text>

            <TouchableOpacity
              onPress={handleConfirmReceipt}
              disabled={isConfirming}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#10b981',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 24,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#ffffff" />
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                    ฉันได้รับอาหารเรียบร้อยแล้ว ✨
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {order.status === OrderStatus.COMPLETED && (
          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: 24,
              padding: 18,
              borderWidth: 1,
              borderColor: '#10b981',
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#10b981', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>
              🎉 ออเดอร์นี้เสร็จสมบูรณ์แล้ว
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
              บันทึกในประวัติการสั่งซื้อเรียบร้อยแล้ว
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/orders')}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 20,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>
                ดูประวัติการสั่งซื้อทั้งหมด 📋
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

