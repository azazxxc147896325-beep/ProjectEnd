import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order, OrderStatus, OrderType } from '@campus-food/shared-types';
import { ChevronRight, RotateCcw, Star, AlertCircle, Utensils, Package } from 'lucide-react-native';

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
        backgroundColor: '#111E18',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1E352B',
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
          borderColor: '#1E352B',
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
                : 'rgba(143, 188, 122, 0.2)',
            }}
          >
            <Text
              style={{
                color: isCancelled ? '#EF4444' : isCompleted ? '#10B981' : '#8FBC7A',
                fontSize: 13,
                fontWeight: '900',
              }}
            >
              คิว #{order.queueNumber}
            </Text>
          </View>
          <Text numberOfLines={1} style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
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
            <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: 'bold' }}>
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
            <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>เสร็จสมบูรณ์</Text>
          </View>
        ) : (
          <ChevronRight size={18} color="#6E8B7E" />
        )}
      </TouchableOpacity>

      {/* Items Preview & Cancel Reason */}
      <TouchableOpacity
        onPress={() => onPressCard(order.id)}
        activeOpacity={0.8}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ color: '#CBD5E1', fontSize: 12, lineHeight: 18 }}>
          {order.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || 'รายการ'}`).join(', ') ||
            'รายการอาหาร'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Text style={{ color: '#88A096', fontSize: 11 }}>
            {formatDateTime(order.createdAt)} •
          </Text>
          {order.orderType === OrderType.DINE_IN ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Utensils size={11} color="#88A096" />
              <Text style={{ color: '#88A096', fontSize: 11 }}>ทานที่ร้าน</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Package size={11} color="#88A096" />
              <Text style={{ color: '#88A096', fontSize: 11 }}>รับกลับบ้าน</Text>
            </View>
          )}
        </View>

        {isCancelled && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: 8,
              padding: 8,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AlertCircle size={14} color="#F87171" />
            <Text style={{ color: '#FCA5A5', fontSize: 11, flex: 1 }}>
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
          borderColor: '#1E352B',
        }}
      >
        <Text style={{ color: '#8FBC7A', fontSize: 15, fontWeight: 'bold' }}>
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
                  backgroundColor: '#162720',
                  borderWidth: 1,
                  borderColor: '#244034',
                }}
              >
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
                <Text style={{ color: '#FBBF24', fontSize: 11, fontWeight: 'bold' }}>รีวิว</Text>
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
                  backgroundColor: '#10B981',
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
                backgroundColor: '#10B981',
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
