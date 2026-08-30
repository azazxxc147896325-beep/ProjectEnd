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
        backgroundColor: '#111E18',
        borderTopWidth: 1,
        borderColor: '#1E352B',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <TextInput
        placeholder="พิมพ์คำถาม เช่น เมนูไม่เกิน 50 บาท, อาหารคลีน..."
        placeholderTextColor="#6E8B7E"
        value={inputQuery}
        onChangeText={onInputChange}
        onSubmitEditing={onSend}
        style={{
          flex: 1,
          backgroundColor: '#162720',
          borderRadius: 20,
          paddingHorizontal: 16,
          height: 42,
          color: '#F8FAFC',
          fontSize: 13,
          borderWidth: 1,
          borderColor: '#244034',
        }}
      />

      <TouchableOpacity
        onPress={onSend}
        disabled={!inputQuery.trim() || loading}
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: inputQuery.trim() && !loading ? '#10B981' : '#1E352B',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Send size={16} color={inputQuery.trim() && !loading ? '#FFFFFF' : '#6E8B7E'} />
      </TouchableOpacity>
    </View>
  );
}
