import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Order, OrderStatus } from '@campus-food/shared-types';
import { XCircle, CheckCircle2, History, Bell } from 'lucide-react-native';

interface OrderActionButtonsProps {
  order: Order;
  onCancel: () => void;
  onConfirmReceipt: () => void;
  onViewAllOrders: () => void;
  isCancelling: boolean;
  isConfirming: boolean;
}

export function OrderActionButtons({
  order,
  onCancel,
  onConfirmReceipt,
  onViewAllOrders,
  isCancelling,
  isConfirming,
}: OrderActionButtonsProps) {
  return (
    <>
      {/* Pending Cancel */}
      {order.status === OrderStatus.PENDING && (
        <View
          style={{
            backgroundColor: '#111E18',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#1E352B',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#88A096', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
            สามารถยกเลิกคำสั่งซื้อได้ก่อนที่ร้านค้าจะกดรับออเดอร์
          </Text>

          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelling}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderWidth: 1,
              borderColor: '#EF4444',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 20,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <XCircle size={16} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: 'bold' }}>
                  ยกเลิกคำสั่งซื้อนี้
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Ready Confirm Receipt */}
      {order.status === OrderStatus.READY && (
        <View
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderRadius: 24,
            padding: 18,
            borderWidth: 1.5,
            borderColor: '#10B981',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Bell size={16} color="#6EE7B7" />
            <Text style={{ color: '#6EE7B7', fontSize: 15, fontWeight: 'bold' }}>
              ร้านค้าปรุงอาหารเสร็จแล้ว
            </Text>
          </View>
          <Text style={{ color: '#88A096', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
            กรุณาไปรับอาหารที่หน้าร้าน และกดยืนยันด้านล่างเพื่อย้ายเข้าสู่ประวัติการสั่งซื้อ
          </Text>

          <TouchableOpacity
            onPress={onConfirmReceipt}
            disabled={isConfirming}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 24,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>
                  ฉันได้รับอาหารเรียบร้อยแล้ว
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Completed */}
      {order.status === OrderStatus.COMPLETED && (
        <View
          style={{
            backgroundColor: '#111E18',
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: '#10B981',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={{ color: '#10B981', fontSize: 15, fontWeight: 'bold' }}>
              คำสั่งซื้อนี้เสร็จสมบูรณ์แล้ว
            </Text>
          </View>
          <Text style={{ color: '#88A096', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
            บันทึกในประวัติการสั่งซื้อเรียบร้อยแล้ว
          </Text>

          <TouchableOpacity
            onPress={onViewAllOrders}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 20,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <History size={15} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>
              ดูประวัติคำสั่งซื้อทั้งหมด
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
