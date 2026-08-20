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
        backgroundColor: '#0f172a',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <MessageSquare size={14} color="#f97316" />
        <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>
          ข้อความระบุเพิ่มเติมถึงแม่ค้า
        </Text>
      </View>

      <TextInput
        placeholder="เช่น เผ็ดน้อย, ไม่ใส่ผักชี, ขอน้ำซุปเพิ่ม..."
        placeholderTextColor="#64748b"
        value={note}
        onChangeText={onNoteChange}
        multiline
        numberOfLines={2}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: 12,
          padding: 10,
          color: '#f8fafc',
          fontSize: 12,
          borderWidth: 1,
          borderColor: '#334155',
        }}
      />
    </View>
  );
}
