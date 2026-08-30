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
      <Text style={{ color: '#88A096', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
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
            backgroundColor: isDineIn ? '#10B981' : '#111E18',
            borderWidth: 1,
            borderColor: isDineIn ? '#10B981' : '#1E352B',
          }}
        >
          <Utensils size={16} color={isDineIn ? '#FFFFFF' : '#88A096'} />
          <Text
            style={{
              color: isDineIn ? '#FFFFFF' : '#88A096',
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
            backgroundColor: isTakeaway ? '#10B981' : '#111E18',
            borderWidth: 1,
            borderColor: isTakeaway ? '#10B981' : '#1E352B',
          }}
        >
          <Package size={16} color={isTakeaway ? '#FFFFFF' : '#88A096'} />
          <Text
            style={{
              color: isTakeaway ? '#FFFFFF' : '#88A096',
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
