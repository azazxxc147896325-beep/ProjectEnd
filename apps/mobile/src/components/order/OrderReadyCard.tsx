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
        backgroundColor: '#111E18',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: isReady ? '#10B981' : isAccepted ? '#10B981' : '#8FBC7A',
        marginBottom: 20,
        shadowColor: isReady ? '#10B981' : '#8FBC7A',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Text style={{ color: '#88A096', fontSize: 13, fontWeight: '600' }}>หมายเลขคิวของคุณ</Text>

      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          marginVertical: 12,
          width: 88,
          height: 88,
          borderRadius: 26,
          backgroundColor: isReady
            ? 'rgba(16, 185, 129, 0.2)'
            : isAccepted
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(143, 188, 122, 0.18)',
          borderWidth: 2.5,
          borderColor: isReady ? '#10B981' : isAccepted ? '#10B981' : '#8FBC7A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: isReady ? '#10B981' : isAccepted ? '#10B981' : '#8FBC7A',
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
          backgroundColor: isReady ? 'rgba(6, 78, 59, 0.85)' : '#162720',
          borderWidth: 1,
          borderColor: isReady ? 'rgba(16, 185, 129, 0.4)' : '#244034',
        }}
      >
        {isReady ? (
          <Bell size={14} color="#6EE7B7" />
        ) : isAccepted ? (
          <CheckCircle2 size={14} color="#6EE7B7" />
        ) : (
          <Clock size={14} color="#88A096" />
        )}
        <Text
          style={{
            color: isReady ? '#6EE7B7' : isAccepted ? '#6EE7B7' : '#F8FAFC',
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
