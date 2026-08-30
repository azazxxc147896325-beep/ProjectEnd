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
        backgroundColor: '#111E18',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1E352B',
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <MessageSquare size={14} color="#8FBC7A" />
        <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 'bold' }}>
          ข้อความระบุเพิ่มเติมถึงร้านค้า
        </Text>
      </View>

      <TextInput
        placeholder="เช่น เผ็ดน้อย, ไม่ใส่ผักชี, ขอน้ำซุปเพิ่ม..."
        placeholderTextColor="#6E8B7E"
        value={note}
        onChangeText={onNoteChange}
        multiline
        numberOfLines={2}
        style={{
          backgroundColor: '#162720',
          borderRadius: 12,
          padding: 10,
          color: '#F8FAFC',
          fontSize: 12,
          borderWidth: 1,
          borderColor: '#244034',
        }}
      />
    </View>
  );
}
