import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';

interface CartEmptyStateProps {
  onBrowseVendors: () => void;
}

export function CartEmptyState({ onBrowseVendors }: CartEmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0A110E',
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
          backgroundColor: '#111E18',
          borderWidth: 1,
          borderColor: '#1E352B',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <ShoppingBag size={36} color="#6E8B7E" />
      </View>
      <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>
        ไม่มีสินค้าในตะกร้า
      </Text>
      <Text
        style={{
          color: '#88A096',
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
          backgroundColor: '#10B981',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>
          ไปเลือกร้านอาหาร
        </Text>
        <ArrowRight size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
