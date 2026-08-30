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
        backgroundColor: '#111E18',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1E352B',
        marginBottom: 16,
        gap: 10,
      }}
    >
      <Store size={20} color="#8FBC7A" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#88A096', fontSize: 11 }}>สั่งอาหารจากร้าน</Text>
        <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' }}>{vendorName}</Text>
      </View>
    </View>
  );
}
