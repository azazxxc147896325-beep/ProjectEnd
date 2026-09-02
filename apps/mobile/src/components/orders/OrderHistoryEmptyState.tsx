import React from 'react';
import { View, Text } from 'react-native';
import { Receipt } from 'lucide-react-native';

interface OrderHistoryEmptyStateProps {
  activeTab: 'active' | 'history';
}

export function OrderHistoryEmptyState({ activeTab }: OrderHistoryEmptyStateProps) {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Receipt size={40} color="#99F6E4" />
      <Text style={{ color: '#64748B', fontSize: 13, marginTop: 12 }}>
        {activeTab === 'active' ? 'ไม่มีออเดอร์ที่กำลังดำเนินการ' : 'ยังไม่มีประวัติคำสั่งซื้อ'}
      </Text>
    </View>
  );
}
