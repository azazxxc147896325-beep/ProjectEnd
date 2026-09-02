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
        backgroundColor: '#F0FDFA',
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
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          shadowColor: '#0F172A',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <ShoppingBag size={36} color="#0D9488" />
      </View>
      <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: 'bold' }}>
        ไม่มีสินค้าในตะกร้า
      </Text>
      <Text
        style={{
          color: '#64748B',
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
          backgroundColor: '#0D9488',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: '#0D9488',
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 3,
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
