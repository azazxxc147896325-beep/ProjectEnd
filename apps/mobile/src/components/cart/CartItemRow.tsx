import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MenuItem } from '@campus-food/shared-types';
import { Plus, Minus } from 'lucide-react-native';

interface CartItemRowProps {
  item: {
    menuItem: MenuItem;
    quantity: number;
    subtotal: number;
  };
  isFirst: boolean;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
}

export function CartItemRow({ item, isFirst, onUpdateQuantity }: CartItemRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: isFirst ? 0 : 1,
        borderColor: '#F1F5F9',
      }}
    >
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
          {item.menuItem.name}
        </Text>
        <Text style={{ color: '#0284C7', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
          ฿{Number(item.menuItem.price)} / จาน
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.menuItem.id, -1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Minus size={14} color="#0F172A" />
        </TouchableOpacity>

        <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold', minWidth: 16, textAlign: 'center' }}>
          {item.quantity}
        </Text>

        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.menuItem.id, 1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: '#0284C7',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Plus size={14} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold', width: 55, textAlign: 'right' }}>
          ฿{item.subtotal}
        </Text>
      </View>
    </View>
  );
}
