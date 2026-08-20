import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

interface CartSummaryCardProps {
  totalPrice: number;
  isSubmitting: boolean;
  onCheckout: () => void;
}

export function CartSummaryCard({
  totalPrice,
  isSubmitting,
  onCheckout,
}: CartSummaryCardProps) {
  return (
    <>
      {/* Payment Breakdown Card */}
      <View
        style={{
          backgroundColor: '#0f172a',
          borderRadius: 20,
          padding: 14,
          borderWidth: 1,
          borderColor: '#1e293b',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>ยอดรวมค่าอาหาร</Text>
          <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>฿{totalPrice}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>ค่าบริการระบบ</Text>
          <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>ฟรี (0 บาท)</Text>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#1e293b',
            paddingTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold' }}>ยอดชำระสุทธิ</Text>
          <Text style={{ color: '#f97316', fontSize: 18, fontWeight: 'bold' }}>฿{totalPrice}</Text>
        </View>
      </View>

      {/* Floating Checkout Button Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: '#0f172a',
          borderRadius: 22,
          padding: 12,
          borderWidth: 1,
          borderColor: '#1e293b',
        }}
      >
        <TouchableOpacity
          onPress={onCheckout}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#f97316',
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                ยืนยันการสั่งซื้อ (฿{totalPrice})
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
