import React from 'react';
import { View, Text } from 'react-native';
import { Order, OrderType, PaymentMethod, PaymentStatus } from '@campus-food/shared-types';
import { Utensils, Package, QrCode, Banknote, CheckCircle2, Clock } from 'lucide-react-native';

interface OrderSummaryCardProps {
  order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const isPromptPay = order.paymentMethod === PaymentMethod.PROMPTPAY;
  const isPaid = order.paymentStatus === PaymentStatus.PAID;

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
        รายละเอียดคำสั่งซื้อ
      </Text>

      {/* Order Type */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ color: '#64748B', fontSize: 12 }}>รูปแบบ</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {order.orderType === OrderType.DINE_IN ? (
            <>
              <Utensils size={13} color="#0284C7" />
              <Text style={{ color: '#0F172A', fontSize: 12, fontWeight: '600' }}>ทานที่ร้าน</Text>
            </>
          ) : (
            <>
              <Package size={13} color="#0284C7" />
              <Text style={{ color: '#0F172A', fontSize: 12, fontWeight: '600' }}>สั่งกลับบ้าน</Text>
            </>
          )}
        </View>
      </View>

      {/* Payment Method & Status */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ color: '#64748B', fontSize: 12 }}>การชำระเงิน</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: isPaid ? '#F0FDF4' : '#FFFBEB',
              borderWidth: 1,
              borderColor: isPaid ? '#BBF7D0' : '#FDE68A',
            }}
          >
            {isPromptPay ? (
              <QrCode size={11} color={isPaid ? '#16A34A' : '#D97706'} />
            ) : (
              <Banknote size={11} color={isPaid ? '#16A34A' : '#D97706'} />
            )}
            <Text
              style={{
                fontSize: 11,
                fontWeight: 'bold',
                color: isPaid ? '#16A34A' : '#D97706',
              }}
            >
              {isPaid
                ? isPromptPay
                  ? 'พร้อมเพย์ (ชำระแล้ว)'
                  : 'เงินสด (ชำระแล้ว)'
                : isPromptPay
                ? 'พร้อมเพย์ (รอชำระ)'
                : 'เงินสด (รอชำระหน้าร้าน)'}
            </Text>
          </View>
        </View>
      </View>

      {/* Note if any */}
      {order.note && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#64748B', fontSize: 12 }}>หมายเหตุ</Text>
          <Text style={{ color: '#D97706', fontSize: 12, fontWeight: '600' }}>{order.note}</Text>
        </View>
      )}

      {/* Items list */}
      {order.items && order.items.length > 0 && (
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            padding: 10,
            marginVertical: 6,
            gap: 6,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          {order.items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#334155', fontSize: 12 }}>
                {item.quantity}x {item.menuItem?.name || 'รายการอาหาร'}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 12 }}>
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
          borderColor: '#F1F5F9',
          paddingTop: 8,
          marginTop: 6,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold' }}>ยอดรวมทั้งหมด</Text>
        <Text style={{ color: '#0284C7', fontSize: 16, fontWeight: 'bold' }}>
          ฿{Number(order.totalPrice).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
