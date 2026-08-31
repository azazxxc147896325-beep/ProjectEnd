import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order } from '@campus-food/shared-types';
import { AlertCircle, History } from 'lucide-react-native';

interface OrderCancelledBannerProps {
  order: Order;
  onViewHistory: () => void;
}

export function OrderCancelledBanner({ order, onViewHistory }: OrderCancelledBannerProps) {
  return (
    <View
      style={{
        backgroundColor: '#FEF2F2',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#FECACA',
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 20,
          backgroundColor: '#FEE2E2',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <AlertCircle size={30} color="#DC2626" />
      </View>

      <Text style={{ color: '#DC2626', fontSize: 17, fontWeight: 'bold', marginBottom: 4 }}>
        {order.cancelledBy === 'vendor' ? 'ร้านค้ายกเลิกคำสั่งซื้อนี้' : 'คุณได้ยกเลิกคำสั่งซื้อนี้แล้ว'}
      </Text>

      <Text style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
        สาเหตุ: {order.cancelReason || (order.cancelledBy === 'vendor' ? 'ร้านค้าไม่สะดวกรับออเดอร์ หรือวัตถุดิบหมด' : 'ผู้สั่งขอยกเลิกออเดอร์')}
      </Text>

      <TouchableOpacity
        onPress={onViewHistory}
        activeOpacity={0.85}
        style={{
          marginTop: 16,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          paddingVertical: 10,
          paddingHorizontal: 18,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <History size={14} color="#0F172A" />
        <Text style={{ color: '#0F172A', fontSize: 12, fontWeight: 'bold' }}>
          ดูประวัติคำสั่งซื้อทั้งหมด
        </Text>
      </TouchableOpacity>
    </View>
  );
}
