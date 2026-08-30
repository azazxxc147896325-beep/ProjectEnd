import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, History } from 'lucide-react-native';

interface OrderHistoryTabsProps {
  activeTab: 'active' | 'history';
  onTabChange: (tab: 'active' | 'history') => void;
  activeCount: number;
  historyCount: number;
}

export function OrderHistoryTabs({
  activeTab,
  onTabChange,
  activeCount,
  historyCount,
}: OrderHistoryTabsProps) {
  const isActive = activeTab === 'active';
  const isHistory = activeTab === 'history';

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#111E18',
        padding: 8,
        borderBottomWidth: 1,
        borderColor: '#1E352B',
        gap: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => onTabChange('active')}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: isActive ? '#10B981' : 'transparent',
        }}
      >
        <Clock size={15} color={isActive ? '#FFFFFF' : '#88A096'} />
        <Text
          style={{
            color: isActive ? '#FFFFFF' : '#88A096',
            fontSize: 13,
            fontWeight: 'bold',
          }}
        >
          กำลังดำเนินการ ({activeCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange('history')}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: isHistory ? '#10B981' : 'transparent',
        }}
      >
        <History size={15} color={isHistory ? '#FFFFFF' : '#88A096'} />
        <Text
          style={{
            color: isHistory ? '#FFFFFF' : '#88A096',
            fontSize: 13,
            fontWeight: 'bold',
          }}
        >
          ประวัติคำสั่งซื้อ ({historyCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}
