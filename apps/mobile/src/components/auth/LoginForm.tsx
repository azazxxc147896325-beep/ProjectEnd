import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <View>
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

      {/* Email Field */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          อีเมลผู้ใช้งาน
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

      {/* Password Field */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          รหัสผ่าน
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
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
            {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleLogin}
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
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>เข้าสู่ระบบ</Text>
            <ArrowRight size={16} color="#ffffff" />
          </>
        )}
      </TouchableOpacity>

      {/* Toggle Helper Footer */}
      <TouchableOpacity onPress={onSwitchToRegister} style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: '#94a3b8', fontSize: 12 }}>
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Text style={{ color: '#f97316', fontWeight: 'bold' }}>สมัครสมาชิกใหม่</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
