import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({
  title = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
  onRetry,
  retryText = 'ลองใหม่อีกครั้ง',
}: ErrorStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F0F7FF',
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          backgroundColor: '#FEF2F2',
          borderWidth: 1.5,
          borderColor: '#FECACA',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <AlertCircle size={36} color="#DC2626" />
      </View>

      <Text
        style={{
          color: '#0F172A',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: '#64748B',
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: 24,
          maxWidth: 280,
        }}
      >
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#0284C7',
            paddingVertical: 12,
            paddingHorizontal: 22,
            borderRadius: 14,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
