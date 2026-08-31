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
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            alignItems: 'center',
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
            สามารถยกเลิกคำสั่งซื้อได้ก่อนที่ร้านค้าจะกดรับออเดอร์
          </Text>

          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelling}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
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
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <XCircle size={16} color="#DC2626" />
                <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: 'bold' }}>
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
            backgroundColor: '#F0FDF4',
            borderRadius: 24,
            padding: 18,
            borderWidth: 1.5,
            borderColor: '#BBF7D0',
            marginBottom: 16,
            alignItems: 'center',
            shadowColor: '#16A34A',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Bell size={16} color="#16A34A" />
            <Text style={{ color: '#16A34A', fontSize: 15, fontWeight: 'bold' }}>
              ร้านค้าปรุงอาหารเสร็จแล้ว
            </Text>
          </View>
          <Text style={{ color: '#64748B', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
            กรุณาไปรับอาหารที่หน้าร้าน และกดยืนยันด้านล่างเพื่อย้ายเข้าสู่ประวัติการสั่งซื้อ
          </Text>

          <TouchableOpacity
            onPress={onConfirmReceipt}
            disabled={isConfirming}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#16A34A',
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 24,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              shadowColor: '#16A34A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
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
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            alignItems: 'center',
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CheckCircle2 size={16} color="#16A34A" />
            <Text style={{ color: '#16A34A', fontSize: 15, fontWeight: 'bold' }}>
              คำสั่งซื้อนี้เสร็จสมบูรณ์แล้ว
            </Text>
          </View>
          <Text style={{ color: '#64748B', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
            บันทึกในประวัติการสั่งซื้อเรียบร้อยแล้ว
          </Text>

          <TouchableOpacity
            onPress={onViewAllOrders}
            style={{
              backgroundColor: '#0284C7',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 20,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              shadowColor: '#0284C7',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 3,
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
