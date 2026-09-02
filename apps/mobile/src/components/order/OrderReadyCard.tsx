import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Order, OrderStatus } from '@campus-food/shared-types';
import { Bell, Clock, CheckCircle2 } from 'lucide-react-native';

interface OrderReadyCardProps {
  order: Order;
}

export function OrderReadyCard({ order }: OrderReadyCardProps) {
  const isReady = order.status === OrderStatus.READY;
  const isAccepted = order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.COOKING;
  const isActive =
    order.status === OrderStatus.PENDING ||
    isAccepted ||
    isReady;

  // Pulse animation for active queue
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isActive]);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: isReady ? '#059669' : isAccepted ? '#0D9488' : '#99F6E4',
        marginBottom: 20,
        shadowColor: isReady ? '#059669' : '#0D9488',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>หมายเลขคิวของคุณ</Text>

      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          marginVertical: 12,
          width: 88,
          height: 88,
          borderRadius: 26,
          backgroundColor: isReady
            ? '#ECFDF5'
            : isAccepted
            ? '#CCFBF1'
            : '#F0FDFA',
          borderWidth: 2.5,
          borderColor: isReady ? '#059669' : isAccepted ? '#0D9488' : '#99F6E4',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: isReady ? '#059669' : isAccepted ? '#0D9488' : '#0F766E',
            fontSize: 34,
            fontWeight: '900',
          }}
        >
          #{order.queueNumber}
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 14,
          backgroundColor: isReady ? '#ECFDF5' : isAccepted ? '#CCFBF1' : '#F8FAFC',
          borderWidth: 1,
          borderColor: isReady ? '#A7F3D0' : isAccepted ? '#99F6E4' : '#E2E8F0',
        }}
      >
        {isReady ? (
          <Bell size={14} color="#059669" />
        ) : isAccepted ? (
          <CheckCircle2 size={14} color="#0D9488" />
        ) : (
          <Clock size={14} color="#64748B" />
        )}
        <Text
          style={{
            color: isReady ? '#059669' : isAccepted ? '#0D9488' : '#0F172A',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {isReady
            ? 'อาหารพร้อมรับแล้ว (รับที่หน้าร้าน)'
            : isAccepted
            ? 'ร้านรับออเดอร์แล้ว • กำลังเตรียม'
            : 'รอร้านค้ายืนยันรับออเดอร์'}
        </Text>
      </View>
    </View>
  );
}
