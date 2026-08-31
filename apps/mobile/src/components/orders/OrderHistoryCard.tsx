import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@campus-food/shared-types';
import { ChevronRight, RotateCcw, Star, AlertCircle, Utensils, Package, QrCode, Banknote } from 'lucide-react-native';

interface OrderHistoryCardProps {
  order: Order;
  activeTab: 'active' | 'history';
  onPressCard: (orderId: string) => void;
  onOpenReview: (order: Order) => void;
  onReorder: (order: Order) => void;
}

export function OrderHistoryCard({
  order,
  activeTab,
  onPressCard,
  onOpenReview,
  onReorder,
}: OrderHistoryCardProps) {
  const isCancelled = order.status === OrderStatus.CANCELLED;
  const isCompleted = order.status === OrderStatus.COMPLETED;
  const isPromptPay = order.paymentMethod === PaymentMethod.PROMPTPAY;
  const isPaid = order.paymentStatus === PaymentStatus.PAID;

  const formatDateTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Header: Queue + Vendor + Status Badge */}
      <TouchableOpacity
        onPress={() => onPressCard(order.id)}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: '#F1F5F9',
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: isCancelled
                ? '#FEF2F2'
                : isCompleted
                ? '#F0FDF4'
                : '#E0F2FE',
            }}
          >
            <Text
              style={{
                color: isCancelled ? '#DC2626' : isCompleted ? '#16A34A' : '#0284C7',
                fontSize: 13,
                fontWeight: '900',
              }}
            >
              คิว #{order.queueNumber}
            </Text>
          </View>
          <Text numberOfLines={1} style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
            {order.vendor?.name || 'ร้านค้า'}
          </Text>
        </View>

        {isCancelled ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
          >
            <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: 'bold' }}>
              {order.cancelledBy === 'vendor' ? 'ร้านยกเลิก' : 'ยกเลิกแล้ว'}
            </Text>
          </View>
        ) : isCompleted ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
            }}
          >
            <Text style={{ color: '#16A34A', fontSize: 11, fontWeight: 'bold' }}>เสร็จสมบูรณ์</Text>
          </View>
        ) : (
          <ChevronRight size={18} color="#94A3B8" />
        )}
      </TouchableOpacity>

      {/* Items Preview & Cancel Reason */}
      <TouchableOpacity
        onPress={() => onPressCard(order.id)}
        activeOpacity={0.8}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ color: '#334155', fontSize: 12, lineHeight: 18 }}>
          {order.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || 'รายการ'}`).join(', ') ||
            'รายการอาหาร'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Text style={{ color: '#64748B', fontSize: 11 }}>
            {formatDateTime(order.createdAt)} •
          </Text>
          {order.orderType === OrderType.DINE_IN ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Utensils size={11} color="#64748B" />
              <Text style={{ color: '#64748B', fontSize: 11 }}>ทานที่ร้าน</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Package size={11} color="#64748B" />
              <Text style={{ color: '#64748B', fontSize: 11 }}>รับกลับบ้าน</Text>
            </View>
          )}
        </View>

        {isCancelled && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: '#FEF2F2',
              borderRadius: 8,
              padding: 8,
              borderWidth: 1,
              borderColor: '#FECACA',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AlertCircle size={14} color="#DC2626" />
            <Text style={{ color: '#DC2626', fontSize: 11, flex: 1 }}>
              {order.cancelledBy === 'vendor' ? 'ร้านค้ายกเลิก: ' : 'คุณยกเลิก: '}
              {order.cancelReason || 'ไม่มีระบุสาเหตุ'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Footer: Price & Actions */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
          borderTopWidth: 1,
          borderColor: '#F1F5F9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#0284C7', fontSize: 15, fontWeight: 'bold' }}>
            ฿{Number(order.totalPrice).toLocaleString()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: isPaid ? '#F0FDF4' : '#FFFBEB',
              borderWidth: 1,
              borderColor: isPaid ? '#BBF7D0' : '#FDE68A',
            }}
          >
            {isPromptPay ? (
              <QrCode size={10} color={isPaid ? '#16A34A' : '#D97706'} />
            ) : (
              <Banknote size={10} color={isPaid ? '#16A34A' : '#D97706'} />
            )}
            <Text
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: isPaid ? '#16A34A' : '#D97706',
              }}
            >
              {isPaid
                ? isPromptPay
                  ? 'พร้อมเพย์'
                  : 'เงินสด'
                : isPromptPay
                ? 'รอโอน'
                : 'รอจ่ายสด'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {activeTab === 'history' && (
            <>
              <TouchableOpacity
                onPress={() => onOpenReview(order)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: '#FFFBEB',
                  borderWidth: 1,
                  borderColor: '#FDE68A',
                }}
              >
                <Star size={12} color="#D97706" fill="#D97706" />
                <Text style={{ color: '#D97706', fontSize: 11, fontWeight: 'bold' }}>รีวิว</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onReorder(order)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: '#0284C7',
                }}
              >
                <RotateCcw size={12} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>สั่งซ้ำ</Text>
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'active' && (
            <TouchableOpacity
              onPress={() => onPressCard(order.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: '#0284C7',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
                ติดตามสถานะ
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
