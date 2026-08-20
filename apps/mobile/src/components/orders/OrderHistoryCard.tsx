import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order, OrderStatus, OrderType } from '@campus-food/shared-types';
import { ChevronRight, RotateCcw, Star } from 'lucide-react-native';

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

  const formatDateTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
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
          borderColor: '#1e293b',
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
                ? 'rgba(239, 68, 68, 0.2)'
                : isCompleted
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(249, 115, 22, 0.2)',
            }}
          >
            <Text
              style={{
                color: isCancelled ? '#ef4444' : isCompleted ? '#10b981' : '#f97316',
                fontSize: 13,
                fontWeight: '900',
              }}
            >
              คิว #{order.queueNumber}
            </Text>
          </View>
          <Text numberOfLines={1} style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
            {order.vendor?.name || 'ร้านค้า'}
          </Text>
        </View>

        {isCancelled ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
            }}
          >
            <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: 'bold' }}>
              {order.cancelledBy === 'vendor' ? 'ร้านยกเลิก' : 'ยกเลิกแล้ว'}
            </Text>
          </View>
        ) : isCompleted ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
            }}
          >
            <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>เสร็จสมบูรณ์</Text>
          </View>
        ) : (
          <ChevronRight size={18} color="#64748b" />
        )}
      </TouchableOpacity>

      {/* Items Preview & Cancel Reason */}
      <TouchableOpacity
        onPress={() => onPressCard(order.id)}
        activeOpacity={0.8}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 18 }}>
          {order.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || 'รายการ'}`).join(', ') ||
            'รายการอาหาร'}
        </Text>
        <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
          {formatDateTime(order.createdAt)} •{' '}
          {order.orderType === OrderType.DINE_IN ? '🍽️ ทานที่ร้าน' : '🛍️ กลับบ้าน'}
        </Text>

        {isCancelled && (
          <View
            style={{
              marginTop: 6,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: 8,
              padding: 6,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <Text style={{ color: '#fca5a5', fontSize: 11 }}>
              {order.cancelledBy === 'vendor' ? '⚠️ ร้านค้ายกเลิก: ' : '🛑 คุณยกเลิก: '}
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
          borderColor: '#1e293b',
        }}
      >
        <Text style={{ color: '#f97316', fontSize: 15, fontWeight: 'bold' }}>
          ฿{Number(order.totalPrice).toLocaleString()}
        </Text>

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
                  backgroundColor: '#1e293b',
                }}
              >
                <Star size={12} color="#fbbf24" />
                <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: 'bold' }}>รีวิว</Text>
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
                  backgroundColor: '#f97316',
                }}
              >
                <RotateCcw size={12} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>สั่งซ้ำ</Text>
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
                backgroundColor: '#f97316',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>
                ติดตามสถานะ
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
