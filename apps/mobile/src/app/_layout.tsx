import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/auth-store';
import { registerForPushNotificationsAsync } from '../lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);




  return (
    <>
      <StatusBar style="light" backgroundColor="#0f172a" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#090d16' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="vendor/[id]"
          options={{
            title: 'เมนูร้านอาหาร',
            headerBackTitle: 'ย้อนกลับ',
          }}
        />
        <Stack.Screen
          name="order/[id]"
          options={{
            title: 'ติดตามสถานะออเดอร์',
            headerBackTitle: 'ออเดอร์',
          }}
        />
      </Stack>
    </>
  );
}
