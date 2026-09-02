import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';

interface VendorFloatingCartBarProps {
  totalCount: number;
  totalPrice: number;
  onPress: () => void;
}

export function VendorFloatingCartBar({
  totalCount,
  totalPrice,
  onPress,
}: VendorFloatingCartBarProps) {
  if (totalCount <= 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#0D9488',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#0D9488', fontSize: 12, fontWeight: 'bold' }}>{totalCount}</Text>
        </View>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
          ฿{totalPrice.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>ดูตะกร้า / ชำระเงิน</Text>
        <ArrowRight size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
