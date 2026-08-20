import React from 'react';
import { View, Text } from 'react-native';
import { Order, OrderStatus } from '@campus-food/shared-types';

interface OrderReadyCardProps {
  order: Order;
}

export function OrderReadyCard({ order }: OrderReadyCardProps) {
  const isReady = order.status === OrderStatus.READY;
  const isCooking = order.status === OrderStatus.COOKING;

  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isReady ? '#10b981' : '#f97316',
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
          borderColor: isReady ? '#10b981' : '#f97316',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: isReady ? '#10b981' : '#f97316',
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
          backgroundColor: isReady ? 'rgba(6, 78, 59, 0.8)' : '#1e293b',
        }}
      >
        <Text
          style={{
            color: isReady ? '#6ee7b7' : '#f8fafc',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {isReady
            ? '🔔 อาหารพร้อมรับแล้ว!'
            : isCooking
            ? '🔥 กำลังปรุงอาหารตามคิว'
            : '⏳ กำลังรอร้านรับออเดอร์'}
        </Text>
      </View>
    </View>
  );
}
