import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';

interface AiInputBarProps {
  inputQuery: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  loading: boolean;
}

export function AiInputBar({
  inputQuery,
  onInputChange,
  onSend,
  loading,
}: AiInputBarProps) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <TextInput
        placeholder="พิมพ์คำถาม เช่น เมนูไม่เกิน 50 บาท, อาหารคลีน..."
        placeholderTextColor="#94A3B8"
        value={inputQuery}
        onChangeText={onInputChange}
        onSubmitEditing={onSend}
        style={{
          flex: 1,
          backgroundColor: '#F8FAFC',
          borderRadius: 20,
          paddingHorizontal: 16,
          height: 42,
          color: '#0F172A',
          fontSize: 13,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        }}
      />

      <TouchableOpacity
        onPress={onSend}
        disabled={!inputQuery.trim() || loading}
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: inputQuery.trim() && !loading ? '#0284C7' : '#E2E8F0',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Send size={16} color={inputQuery.trim() && !loading ? '#FFFFFF' : '#94A3B8'} />
      </TouchableOpacity>
    </View>
  );
}
