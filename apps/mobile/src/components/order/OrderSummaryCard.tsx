import React from 'react';
import { View, Text } from 'react-native';
import { Order, OrderType } from '@campus-food/shared-types';
import { Utensils, Package } from 'lucide-react-native';

interface OrderSummaryCardProps {
  order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#111E18',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#1E352B',
        marginBottom: 20,
      }}
    >
      <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
        รายละเอียดคำสั่งซื้อ
      </Text>

      {/* Order Type */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ color: '#88A096', fontSize: 12 }}>รูปแบบ</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {order.orderType === OrderType.DINE_IN ? (
            <>
              <Utensils size={13} color="#8FBC7A" />
              <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '600' }}>ทานที่ร้าน</Text>
            </>
          ) : (
            <>
              <Package size={13} color="#8FBC7A" />
              <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '600' }}>สั่งกลับบ้าน</Text>
            </>
          )}
        </View>
      </View>

      {/* Note if any */}
      {order.note && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#88A096', fontSize: 12 }}>หมายเหตุ</Text>
          <Text style={{ color: '#FBBF24', fontSize: 12, fontWeight: '600' }}>{order.note}</Text>
        </View>
      )}

      {/* Items list */}
      {order.items && order.items.length > 0 && (
        <View
          style={{
            backgroundColor: '#0A110E',
            borderRadius: 14,
            padding: 10,
            marginVertical: 6,
            gap: 6,
            borderWidth: 1,
            borderColor: '#1E352B',
          }}
        >
          {order.items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#CBD5E1', fontSize: 12 }}>
                {item.quantity}x {item.menuItem?.name || 'รายการอาหาร'}
              </Text>
              <Text style={{ color: '#88A096', fontSize: 12 }}>
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
          borderColor: '#1E352B',
          paddingTop: 8,
          marginTop: 6,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' }}>ยอดรวมทั้งหมด</Text>
        <Text style={{ color: '#8FBC7A', fontSize: 16, fontWeight: 'bold' }}>
          ฿{Number(order.totalPrice).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
