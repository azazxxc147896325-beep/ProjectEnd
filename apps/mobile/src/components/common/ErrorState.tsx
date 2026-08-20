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
        backgroundColor: '#090d16',
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderWidth: 1.5,
          borderColor: 'rgba(239, 68, 68, 0.35)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <AlertCircle size={36} color="#ef4444" />
      </View>

      <Text
        style={{
          color: '#f8fafc',
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
          color: '#94a3b8',
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
            backgroundColor: '#f97316',
            paddingVertical: 12,
            paddingHorizontal: 22,
            borderRadius: 14,
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <RefreshCw size={16} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
