import React from 'react';
import { View, Text } from 'react-native';
import { Order, OrderType } from '@campus-food/shared-types';

interface OrderSummaryCardProps {
  order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 20,
      }}
    >
      <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
        รายละเอียดคำสั่งซื้อ
      </Text>

      {/* Order Type */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: '#94a3b8', fontSize: 12 }}>รูปแบบ</Text>
        <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>
          {order.orderType === OrderType.DINE_IN ? '🍽️ ทานที่ร้าน' : '🛍️ สั่งกลับบ้าน'}
        </Text>
      </View>

      {/* Note if any */}
      {order.note && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>หมายเหตุ</Text>
          <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '600' }}>{order.note}</Text>
        </View>
      )}

      {/* Items list */}
      {order.items && order.items.length > 0 && (
        <View
          style={{
            backgroundColor: '#090d16',
            borderRadius: 14,
            padding: 10,
            marginVertical: 6,
            gap: 6,
          }}
        >
          {order.items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#cbd5e1', fontSize: 12 }}>
                {item.quantity}x {item.menuItem?.name || 'รายการอาหาร'}
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                ฿{Number(item.subtotal || 0).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Total Price */}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: '#1e293b',
          paddingTop: 8,
          marginTop: 6,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>ยอดรวมทั้งหมด</Text>
        <Text style={{ color: '#f97316', fontSize: 16, fontWeight: 'bold' }}>
          ฿{Number(order.totalPrice).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
