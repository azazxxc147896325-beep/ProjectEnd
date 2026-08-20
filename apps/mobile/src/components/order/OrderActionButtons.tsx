import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Order, OrderStatus } from '@campus-food/shared-types';
import { XCircle, CheckCircle2 } from 'lucide-react-native';

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
            backgroundColor: '#0f172a',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#334155',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
            สามารถยกเลิกคำสั่งซื้อได้ก่อนที่ร้านค้าจะเริ่มปรุงอาหาร
          </Text>

          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelling}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderWidth: 1,
              borderColor: '#ef4444',
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
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <XCircle size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: 'bold' }}>
                  ยกเลิกคำสั่งซื้อนี้ ❌
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
            borderColor: '#10b981',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#6ee7b7', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>
            🔔 พ่อค้า/แม่ค้าทำอาหารเสร็จแล้ว!
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
            กรุณาไปรับอาหารที่หน้าร้าน และกดยืนยันด้านล่างเพื่อย้ายเข้าสู่ประวัติการสั่งซื้อ
          </Text>

          <TouchableOpacity
            onPress={onConfirmReceipt}
            disabled={isConfirming}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#10b981',
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 24,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <CheckCircle2 size={18} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                  ฉันได้รับอาหารเรียบร้อยแล้ว ✨
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
            backgroundColor: '#0f172a',
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: '#10b981',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#10b981', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>
            🎉 ออเดอร์นี้เสร็จสมบูรณ์แล้ว
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
            บันทึกในประวัติการสั่งซื้อเรียบร้อยแล้ว
          </Text>

          <TouchableOpacity
            onPress={onViewAllOrders}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 20,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>
              ดูประวัติการสั่งซื้อทั้งหมด 📋
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
