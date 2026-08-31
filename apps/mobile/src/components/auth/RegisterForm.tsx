import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { User as UserIcon, Mail, Phone, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <View>
      {/* Error Banner */}
      {errorMessage && (
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            borderRadius: 14,
            padding: 12,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={16} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600', flex: 1 }}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Full Name */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          ชื่อ-นามสกุล *
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            paddingHorizontal: 12,
            height: 48,
          }}
        >
          <UserIcon size={18} color="#0284C7" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="เช่น สมชาย ใจดี"
            placeholderTextColor="#94A3B8"
            value={fullName}
            onChangeText={setFullName}
            style={{ flex: 1, color: '#0F172A', fontSize: 14 }}
          />
        </View>
      </View>

      {/* Email Field */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          อีเมลสำหรับเข้าสู่ระบบ *
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            paddingHorizontal: 12,
            height: 48,
          }}
        >
          <Mail size={18} color="#0284C7" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="your.email@campus.ac.th"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ flex: 1, color: '#0F172A', fontSize: 14 }}
          />
        </View>
      </View>

      {/* Phone Number */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          เบอร์โทรศัพท์ (สำหรับแจ้งเตือนออเดอร์)
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            paddingHorizontal: 12,
            height: 48,
          }}
        >
          <Phone size={18} color="#0284C7" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="0812345678"
            placeholderTextColor="#94A3B8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ flex: 1, color: '#0F172A', fontSize: 14 }}
          />
        </View>
      </View>

      {/* Password Field */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            paddingHorizontal: 12,
            height: 48,
          }}
        >
          <Lock size={18} color="#0284C7" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{ flex: 1, color: '#0F172A', fontSize: 14 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
            {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          ยืนยันรหัสผ่านอีกครั้ง *
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            paddingHorizontal: 12,
            height: 48,
          }}
        >
          <Lock size={18} color="#0284C7" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            style={{ flex: 1, color: '#0F172A', fontSize: 14 }}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
        style={{
          backgroundColor: '#0284C7',
          borderRadius: 16,
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 4,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
              สร้างบัญชีและเข้าสู่ระบบ
            </Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      {/* Toggle Helper Footer */}
      <TouchableOpacity onPress={onSwitchToLogin} style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: '#64748B', fontSize: 12 }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Text style={{ color: '#0284C7', fontWeight: 'bold' }}>เข้าสู่ระบบที่นี่</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
