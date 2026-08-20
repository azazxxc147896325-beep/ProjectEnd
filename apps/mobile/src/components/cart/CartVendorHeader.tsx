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
        backgroundColor: '#0f172a',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 16,
        gap: 10,
      }}
    >
      <Store size={20} color="#f97316" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#94a3b8', fontSize: 11 }}>สั่งอาหารจากร้าน</Text>
        <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold' }}>{vendorName}</Text>
      </View>
    </View>
  );
}
