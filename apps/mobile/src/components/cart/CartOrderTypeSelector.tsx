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
      <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
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
            backgroundColor: isDineIn ? '#0284C7' : '#F8FAFC',
            borderWidth: 1,
            borderColor: isDineIn ? '#0284C7' : '#E2E8F0',
          }}
        >
          <Utensils size={16} color={isDineIn ? '#FFFFFF' : '#64748B'} />
          <Text
            style={{
              color: isDineIn ? '#FFFFFF' : '#64748B',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            ทานที่ร้าน
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
            backgroundColor: isTakeaway ? '#0284C7' : '#F8FAFC',
            borderWidth: 1,
            borderColor: isTakeaway ? '#0284C7' : '#E2E8F0',
          }}
        >
          <Package size={16} color={isTakeaway ? '#FFFFFF' : '#64748B'} />
          <Text
            style={{
              color: isTakeaway ? '#FFFFFF' : '#64748B',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            รับกลับบ้าน
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
