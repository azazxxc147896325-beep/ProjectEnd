import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth-store';
import {
  Utensils,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  UserPlus,
  LogIn,
} from 'lucide-react-native';

export default function MobileLoginScreen() {
  const router = useRouter();
  const { login, register, isAuthenticated, isHydrated } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // หากเข้าสู่ระบบแล้ว ให้ไปหน้าแท็บหลักทันที (ต้องอยู่หลัง hooks ทุกตัว)
  if (isHydrated && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-นามสกุลของคุณ');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('กรุณากรอกอีเมล');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err?.message || 'ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#090d16' }}
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
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              borderWidth: 1.5,
              borderColor: 'rgba(249, 115, 22, 0.4)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Utensils size={32} color="#f97316" />
          </View>
          <Text
            style={{
              color: '#f8fafc',
              fontSize: 22,
              fontWeight: '900',
              letterSpacing: -0.5,
            }}
          >
            Campus Food
          </Text>
          <Text
            style={{
              color: '#94a3b8',
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
            backgroundColor: '#0f172a',
            borderRadius: 16,
            padding: 4,
            borderWidth: 1,
            borderColor: '#1e293b',
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: mode === 'login' ? '#f97316' : 'transparent',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <LogIn size={15} color={mode === 'login' ? '#ffffff' : '#94a3b8'} />
            <Text
              style={{
                color: mode === 'login' ? '#ffffff' : '#94a3b8',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              เข้าสู่ระบบ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: mode === 'register' ? '#f97316' : 'transparent',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <UserPlus size={15} color={mode === 'register' ? '#ffffff' : '#94a3b8'} />
            <Text
              style={{
                color: mode === 'register' ? '#ffffff' : '#94a3b8',
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
            backgroundColor: '#0f172a',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#1e293b',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          {/* Error Banner */}
          {errorMessage && (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.4)',
                borderRadius: 14,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#fca5a5', fontSize: 12, fontWeight: '600' }}>
                ⚠️ {errorMessage}
              </Text>
            </View>
          )}

          {/* REGISTER MODE: Full Name */}
          {mode === 'register' && (
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 12,
                  fontWeight: '700',
                  marginBottom: 6,
                }}
              >
                ชื่อ-นามสกุล *
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1e293b',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#334155',
                  paddingHorizontal: 12,
                  height: 48,
                }}
              >
                <UserIcon size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="เช่น สมชาย ใจดี"
                  placeholderTextColor="#475569"
                  value={fullName}
                  onChangeText={setFullName}
                  style={{ flex: 1, color: '#f8fafc', fontSize: 14 }}
                />
              </View>
            </View>
          )}

          {/* Email Field */}
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: '700',
                marginBottom: 6,
              }}
            >
              {mode === 'register' ? 'อีเมลสำหรับเข้าสู่ระบบ *' : 'อีเมลผู้ใช้งาน'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1e293b',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#334155',
                paddingHorizontal: 12,
                height: 48,
              }}
            >
              <Mail size={18} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="your.email@campus.ac.th"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ flex: 1, color: '#f8fafc', fontSize: 14 }}
              />
            </View>
          </View>

          {/* REGISTER MODE: Phone Number */}
          {mode === 'register' && (
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 12,
                  fontWeight: '700',
                  marginBottom: 6,
                }}
              >
                เบอร์โทรศัพท์ (สำหรับแจ้งเตือนออเดอร์)
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1e293b',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#334155',
                  paddingHorizontal: 12,
                  height: 48,
                }}
              >
                <Phone size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="0812345678"
                  placeholderTextColor="#475569"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={{ flex: 1, color: '#f8fafc', fontSize: 14 }}
                />
              </View>
            </View>
          )}

          {/* Password Field */}
          <View style={{ marginBottom: mode === 'register' ? 14 : 20 }}>
            <Text
              style={{
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: '700',
                marginBottom: 6,
              }}
            >
              {mode === 'register' ? 'รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *' : 'รหัสผ่าน'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1e293b',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#334155',
                paddingHorizontal: 12,
                height: 48,
              }}
            >
              <Lock size={18} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ flex: 1, color: '#f8fafc', fontSize: 14 }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#94a3b8" />
                ) : (
                  <Eye size={18} color="#94a3b8" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* REGISTER MODE: Confirm Password */}
          {mode === 'register' && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 12,
                  fontWeight: '700',
                  marginBottom: 6,
                }}
              >
                ยืนยันรหัสผ่านอีกครั้ง *
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1e293b',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#334155',
                  paddingHorizontal: 12,
                  height: 48,
                }}
              >
                <Lock size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, color: '#f8fafc', fontSize: 14 }}
                />
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 16,
              height: 48,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 4,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
                  {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีและเข้าสู่ระบบ'}
                </Text>
                <ArrowRight size={16} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          {/* Toggle Helper Footer */}
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage(null);
            }}
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>
              {mode === 'login' ? (
                <>
                  ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                  <Text style={{ color: '#f97316', fontWeight: 'bold' }}>
                    สมัครสมาชิกใหม่
                  </Text>
                </>
              ) : (
                <>
                  มีบัญชีอยู่แล้ว?{' '}
                  <Text style={{ color: '#f97316', fontWeight: 'bold' }}>
                    เข้าสู่ระบบที่นี่
                  </Text>
                </>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
