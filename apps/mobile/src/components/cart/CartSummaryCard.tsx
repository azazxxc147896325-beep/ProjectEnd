import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowRight, ShoppingBag } from 'lucide-react-native';

interface CartSummaryCardProps {
  totalPrice: number;
  totalCount: number;
  vendorCount: number;
  isSubmitting: boolean;
  onCheckout: () => void;
}

export function CartSummaryCard({
  totalPrice,
  totalCount,
  vendorCount,
  isSubmitting,
  onCheckout,
}: CartSummaryCardProps) {
  return (
    <>
      {/* Payment Breakdown Card */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          marginBottom: 16,
          shadowColor: '#0F172A',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#64748B', fontSize: 13 }}>จำนวนร้านค้าในตะกร้า</Text>
          <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>{vendorCount} ร้าน</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#64748B', fontSize: 13 }}>จำนวนรายการทั้งหมด</Text>
          <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>{totalCount} จาน</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#64748B', fontSize: 13 }}>ยอดรวมค่าอาหารทั้งหมด</Text>
          <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>
            ฿{totalPrice.toLocaleString()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: '#64748B', fontSize: 13 }}>ค่าบริการระบบ</Text>
          <Text style={{ color: '#16A34A', fontSize: 13, fontWeight: '600' }}>ฟรี (0 บาท)</Text>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#F1F5F9',
            paddingTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: 'bold' }}>ยอดชำระสุทธิรวม</Text>
          <Text style={{ color: '#0D9488', fontSize: 20, fontWeight: 'bold' }}>
            ฿{totalPrice.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Floating Checkout Button Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          padding: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={onCheckout}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#0D9488',
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            shadowColor: '#0D9488',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <ShoppingBag size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>
                {vendorCount > 1
                  ? `สั่งซื้อทุกร้านพร้อมกัน (${vendorCount} ร้าน • ฿${totalPrice.toLocaleString()})`
                  : `ยืนยันการสั่งซื้อ (฿${totalPrice.toLocaleString()})`}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
