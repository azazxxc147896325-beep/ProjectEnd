import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth-store';
import { Utensils, UserPlus, LogIn } from 'lucide-react-native';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export default function MobileLoginScreen() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // หากเข้าสู่ระบบแล้ว ให้ไปหน้าแท็บหลักทันที
  if (isHydrated && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0A110E' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 22,
              backgroundColor: 'rgba(143, 188, 122, 0.15)',
              borderWidth: 1.5,
              borderColor: 'rgba(143, 188, 122, 0.4)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              shadowColor: '#8FBC7A',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Utensils size={32} color="#8FBC7A" />
          </View>
          <Text
            style={{
              color: '#F8FAFC',
              fontSize: 22,
              fontWeight: '900',
              letterSpacing: -0.5,
            }}
          >
            Campus Food
          </Text>
          <Text
            style={{
              color: '#88A096',
              fontSize: 12,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            ระบบสั่งอาหารและจองคิวโรงอาหารมหาวิทยาลัย
          </Text>
        </View>

        {/* Tab Switcher: เข้าสู่ระบบ vs สมัครสมาชิก */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#111E18',
            borderRadius: 16,
            padding: 4,
            borderWidth: 1,
            borderColor: '#1E352B',
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setMode('login')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: mode === 'login' ? '#10B981' : 'transparent',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <LogIn size={15} color={mode === 'login' ? '#FFFFFF' : '#88A096'} />
            <Text
              style={{
                color: mode === 'login' ? '#FFFFFF' : '#88A096',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              เข้าสู่ระบบ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('register')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: mode === 'register' ? '#10B981' : 'transparent',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <UserPlus size={15} color={mode === 'register' ? '#FFFFFF' : '#88A096'} />
            <Text
              style={{
                color: mode === 'register' ? '#FFFFFF' : '#88A096',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              สมัครสมาชิกใหม่
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View
          style={{
            backgroundColor: '#111E18',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#1E352B',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
