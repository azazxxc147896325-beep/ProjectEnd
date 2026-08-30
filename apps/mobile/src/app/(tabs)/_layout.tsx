import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Utensils, ShoppingBag, Receipt, User, Bot } from 'lucide-react-native';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const totalCount = useCartStore((state) => state.getTotalCount());

  // รอให้ SecureStore โหลดเสร็จ
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A110E' }}>
        <ActivityIndicator size="large" color="#8FBC7A" />
      </View>
    );
  }

  // หากยังไม่ได้เข้าสู่ระบบ ให้ Redirect ไปหน้า Login อย่างปลอดภัย
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#111E18',
          borderTopColor: '#1E352B',
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#8FBC7A',
        tabBarInactiveTintColor: '#6E8B7E',
        headerStyle: {
          backgroundColor: '#111E18',
          borderBottomColor: '#1E352B',
          borderBottomWidth: 1,
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ค้นหาร้าน',
          headerTitle: 'Campus Food',
          tabBarIcon: ({ color, size }) => <Utensils color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'แนะนำอาหาร',
          headerTitle: 'AI น้องหยก ผู้ช่วยแนะนำอาหาร',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? 'rgba(143, 188, 122, 0.2)' : 'transparent',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Bot color={color} size={size || 20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'ตะกร้า',
          headerTitle: 'ตะกร้าสินค้าของคุณ',
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'ออเดอร์',
          headerTitle: 'รายการออเดอร์ของคุณ',
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size || 20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          headerTitle: 'ข้อมูลนักศึกษา',
          tabBarIcon: ({ color, size }) => <User color={color} size={size || 20} />,
        }}
      />
    </Tabs>
  );
}
