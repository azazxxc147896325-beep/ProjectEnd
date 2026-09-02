import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Check } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';
import { getSavedCredentials, saveCredentials } from '../../lib/saved-credentials';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ดึงข้อมูลอีเมล/รหัสผ่านที่เคยบันทึกไว้ (Auto-fill)
  useEffect(() => {
    let isMounted = true;
    getSavedCredentials().then((saved) => {
      if (!isMounted) return;
      if (saved.rememberMe) {
        setEmail(saved.email);
        setPassword(saved.password);
        setRememberPassword(true);
      } else if (saved.email) {
        setEmail(saved.email);
        setRememberPassword(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(email.trim(), password);
      // บันทึกหรือลบข้อมูลรหัสผ่านตามค่า rememberPassword
      await saveCredentials(email.trim(), password, rememberPassword);
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

      {/* Email Field */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          อีเมลผู้ใช้งาน
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
          <Mail size={18} color="#0D9488" style={{ marginRight: 10 }} />
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

      {/* Password Field */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
          รหัสผ่าน
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
          <Lock size={18} color="#0D9488" style={{ marginRight: 10 }} />
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

      {/* Remember Password Checkbox */}
      <TouchableOpacity
        onPress={() => setRememberPassword(!rememberPassword)}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          gap: 10,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: rememberPassword ? '#0D9488' : '#CBD5E1',
            backgroundColor: rememberPassword ? '#0D9488' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {rememberPassword && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
        </View>
        <Text style={{ color: '#475569', fontSize: 13, fontWeight: '500' }}>
          จดจำข้อมูลเข้าสู่ระบบในเครื่องนี้
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
        style={{
          backgroundColor: '#0D9488',
          borderRadius: 16,
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          shadowColor: '#0D9488',
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
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>เข้าสู่ระบบ</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      {/* Toggle Helper Footer */}
      <TouchableOpacity onPress={onSwitchToRegister} style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: '#64748B', fontSize: 12 }}>
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Text style={{ color: '#0D9488', fontWeight: 'bold' }}>สมัครสมาชิกใหม่</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
