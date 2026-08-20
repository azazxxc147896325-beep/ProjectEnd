import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order } from '@campus-food/shared-types';
import { Ban } from 'lucide-react-native';

interface OrderCancelledBannerProps {
  order: Order;
  onViewHistory: () => void;
}

export function OrderCancelledBanner({ order, onViewHistory }: OrderCancelledBannerProps) {
  return (
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
        onPress={onViewHistory}
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
  );
}
