import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

interface CartEmptyStateProps {
  onBrowseVendors: () => void;
}

export function CartEmptyState({ onBrowseVendors }: CartEmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#090d16',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#1e293b',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <ShoppingBag size={36} color="#64748b" />
      </View>
      <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold' }}>
        ไม่มีสินค้าในตะกร้า
      </Text>
      <Text
        style={{
          color: '#64748b',
          fontSize: 13,
          textAlign: 'center',
          marginTop: 6,
          lineHeight: 18,
        }}
      >
        เลือกดูเมนูอร่อยๆ จากร้านค้าในโรงอาหาร แล้วกดสั่งอาหารได้เลยครับ
      </Text>

      <TouchableOpacity
        onPress={onBrowseVendors}
        style={{
          marginTop: 24,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: '#f97316',
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>
          ไปเลือกร้านอาหาร
        </Text>
      </TouchableOpacity>
    </View>
  );
}
