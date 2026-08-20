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
        backgroundColor: '#0f172a',
        borderTopWidth: 1,
        borderColor: '#1e293b',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <TextInput
        placeholder="ถามน้องหยกได้เลย เช่น งบ 50 บาท, ของเผ็ดๆ..."
        placeholderTextColor="#64748b"
        value={inputQuery}
        onChangeText={onInputChange}
        onSubmitEditing={onSend}
        style={{
          flex: 1,
          backgroundColor: '#1e293b',
          borderRadius: 20,
          paddingHorizontal: 16,
          height: 42,
          color: '#f8fafc',
          fontSize: 13,
        }}
      />

      <TouchableOpacity
        onPress={onSend}
        disabled={!inputQuery.trim() || loading}
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: inputQuery.trim() && !loading ? '#f97316' : '#334155',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Send size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
