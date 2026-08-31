import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

interface CartNoteInputProps {
  note: string;
  onNoteChange: (text: string) => void;
}

export function CartNoteInput({ note, onNoteChange }: CartNoteInputProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <MessageSquare size={14} color="#0284C7" />
        <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
          ข้อความระบุเพิ่มเติมถึงร้านค้า
        </Text>
      </View>

      <TextInput
        placeholder="เช่น เผ็ดน้อย, ไม่ใส่ผักชี, ขอน้ำซุปเพิ่ม..."
        placeholderTextColor="#94A3B8"
        value={note}
        onChangeText={onNoteChange}
        multiline
        numberOfLines={2}
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 12,
          padding: 10,
          color: '#0F172A',
          fontSize: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        }}
      />
    </View>
  );
}
