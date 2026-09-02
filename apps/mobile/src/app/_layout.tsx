import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { LottieSplashScreen } from '../components/LottieSplashScreen';

import { ToastContainer } from '../components/common/ToastContainer';
import { CustomConfirmModal } from '../components/common/CustomConfirmModal';

// Keep the native splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        // Hide native splash so Lottie animation displays seamlessly
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <LottieSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#0F172A',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F0FDFA' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: 'fade',
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

      {/* Global Toast & Custom Confirmation Modal */}
      <ToastContainer />
      <CustomConfirmModal />
    </>
  );
}
