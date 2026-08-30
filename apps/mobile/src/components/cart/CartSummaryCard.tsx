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
          backgroundColor: '#111E18',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#1E352B',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#88A096', fontSize: 13 }}>จำนวนร้านค้าในตะกร้า</Text>
          <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>{vendorCount} ร้าน</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#88A096', fontSize: 13 }}>จำนวนรายการทั้งหมด</Text>
          <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>{totalCount} จาน</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#88A096', fontSize: 13 }}>ยอดรวมค่าอาหารทั้งหมด</Text>
          <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>
            ฿{totalPrice.toLocaleString()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: '#88A096', fontSize: 13 }}>ค่าบริการระบบ</Text>
          <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>ฟรี (0 บาท)</Text>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#1E352B',
            paddingTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' }}>ยอดชำระสุทธิรวม</Text>
          <Text style={{ color: '#8FBC7A', fontSize: 20, fontWeight: 'bold' }}>
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
          backgroundColor: '#111E18',
          borderRadius: 22,
          padding: 12,
          borderWidth: 1,
          borderColor: '#1E352B',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={onCheckout}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#10B981',
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
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
