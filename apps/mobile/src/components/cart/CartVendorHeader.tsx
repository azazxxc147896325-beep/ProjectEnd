import React from 'react';
import { View, Text } from 'react-native';
import { Store } from 'lucide-react-native';

interface CartVendorHeaderProps {
  vendorName: string;
}

export function CartVendorHeader({ vendorName }: CartVendorHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
        gap: 10,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Store size={20} color="#0284C7" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#64748B', fontSize: 11 }}>สั่งอาหารจากร้าน</Text>
        <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: 'bold' }}>{vendorName}</Text>
      </View>
    </View>
  );
}
