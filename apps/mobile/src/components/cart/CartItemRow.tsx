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
        borderColor: '#1E352B',
      }}
    >
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 'bold' }}>
          {item.menuItem.name}
        </Text>
        <Text style={{ color: '#8FBC7A', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
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
            backgroundColor: '#162720',
            borderWidth: 1,
            borderColor: '#244034',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Minus size={14} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 'bold', minWidth: 16, textAlign: 'center' }}>
          {item.quantity}
        </Text>

        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.menuItem.id, 1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: '#10B981',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Plus size={14} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 'bold', width: 55, textAlign: 'right' }}>
          ฿{item.subtotal}
        </Text>
      </View>
    </View>
  );
}
