import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { OrderType } from '@campus-food/shared-types';
import { Utensils, Package } from 'lucide-react-native';

interface CartOrderTypeSelectorProps {
  orderType: OrderType;
  onSelectOrderType: (type: OrderType) => void;
}

export function CartOrderTypeSelector({
  orderType,
  onSelectOrderType,
}: CartOrderTypeSelectorProps) {
  const isDineIn = orderType === OrderType.DINE_IN;
  const isTakeaway = orderType === OrderType.TAKEAWAY;

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
        เลือกรูปแบบการรับประทาน *
      </Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => onSelectOrderType(OrderType.DINE_IN)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: isDineIn ? '#f97316' : '#0f172a',
            borderWidth: 1,
            borderColor: isDineIn ? '#f97316' : '#1e293b',
          }}
        >
          <Utensils size={16} color={isDineIn ? '#ffffff' : '#94a3b8'} />
          <Text
            style={{
              color: isDineIn ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            🍽️ ทานที่ร้าน
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectOrderType(OrderType.TAKEAWAY)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: isTakeaway ? '#f97316' : '#0f172a',
            borderWidth: 1,
            borderColor: isTakeaway ? '#f97316' : '#1e293b',
          }}
        >
          <Package size={16} color={isTakeaway ? '#ffffff' : '#94a3b8'} />
          <Text
            style={{
              color: isTakeaway ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            🛍️ กลับบ้าน
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
