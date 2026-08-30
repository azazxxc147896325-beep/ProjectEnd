import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/auth-store';

export default function Index() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // รอจนกว่าจะอ่านค่า Auth จาก SecureStore เสร็จสมบูรณ์
  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0A110E',
        }}
      >
        <ActivityIndicator size="large" color="#8FBC7A" />
      </View>
    );
  }

  // หากเข้าสู่ระบบแล้ว ให้ไปหน้าหลัก (Tabs)
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // หากยังไม่ได้เข้าสู่ระบบ ให้ไปหน้า Login ทันที
  return <Redirect href="/login" />;
}
