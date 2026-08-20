import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

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
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#0f172a',
        padding: 8,
        borderBottomWidth: 1,
        borderColor: '#1e293b',
      }}
    >
      <TouchableOpacity
        onPress={() => onTabChange('active')}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: activeTab === 'active' ? '#f97316' : 'transparent',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: activeTab === 'active' ? '#ffffff' : '#94a3b8',
            fontSize: 13,
            fontWeight: 'bold',
          }}
        >
          🔥 กำลังดำเนินการ ({activeCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange('history')}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: activeTab === 'history' ? '#f97316' : 'transparent',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: activeTab === 'history' ? '#ffffff' : '#94a3b8',
            fontSize: 13,
            fontWeight: 'bold',
          }}
        >
          📜 ประวัติคำสั่งซื้อ ({historyCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}
