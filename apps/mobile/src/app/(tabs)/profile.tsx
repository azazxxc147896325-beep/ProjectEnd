import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { mobileToast } from '../../stores/toast-store';
import { User, LogOut, Server, LogIn, Phone, Mail, ShieldCheck } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    mobileToast.confirm({
      title: 'ออกจากระบบ',
      message: 'คุณต้องการออกจากระบบใช่หรือไม่?',
      confirmText: 'ออกจากระบบ',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: () => {
        logout();
        mobileToast.info('ออกจากระบบเรียบร้อยแล้ว');
        router.replace('/login');
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F0F7FF' }} contentContainerStyle={{ padding: 16 }}>
      {/* Profile Card */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          alignItems: 'center',
          marginBottom: 16,
          shadowColor: '#0F172A',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#E0F2FE',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
            borderWidth: 2,
            borderColor: '#BAE6FD',
          }}
        >
          <Text style={{ color: '#0284C7', fontSize: 28, fontWeight: 'bold' }}>
            {user?.fullName?.slice(0, 1)?.toUpperCase() || 'U'}
          </Text>
        </View>

        <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: 'bold' }}>
          {user?.fullName || 'ผู้ใช้งานทั่วไป'}
        </Text>
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
          {user?.email || 'ยังไม่ได้เข้าสู่ระบบ'}
        </Text>

        {!isAuthenticated ? (
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 14,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: '#0284C7',
              borderRadius: 14,
              shadowColor: '#0284C7',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <LogIn size={15} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>
              เข้าสู่ระบบ / สมัครสมาชิก
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* User Information Details */}
      {user && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold', marginBottom: 14 }}>
            ข้อมูลบัญชีผู้ใช้งาน
          </Text>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <User size={16} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#64748B', fontSize: 11 }}>ชื่อ-นามสกุล</Text>
                <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>
                  {user.fullName}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Mail size={16} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#64748B', fontSize: 11 }}>อีเมล</Text>
                <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>
                  {user.email}
                </Text>
              </View>
            </View>

            {user.phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color="#0284C7" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#64748B', fontSize: 11 }}>เบอร์โทรศัพท์</Text>
                  <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>
                    {user.phone}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={16} color="#16A34A" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#64748B', fontSize: 11 }}>สถานะบัญชี</Text>
                <Text style={{ color: '#16A34A', fontSize: 13, fontWeight: '600' }}>
                  นักศึกษา / ผู้ใช้งานทั่วไป (Student)
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Connection Info */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 18,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          marginBottom: 16,
          shadowColor: '#0F172A',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Server size={16} color="#0284C7" />
          <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold' }}>
            การเชื่อมต่อระบบ
          </Text>
        </View>
        <Text style={{ color: '#64748B', fontSize: 11, lineHeight: 16 }}>
          API: {process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api'}
        </Text>
        <Text style={{ color: '#64748B', fontSize: 11, lineHeight: 16 }}>
          WS: {process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:4000'}
        </Text>
      </View>

      {/* Logout Button */}
      {user && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 14,
            borderRadius: 14,
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
        >
          <LogOut size={16} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 14, fontWeight: 'bold' }}>
            ออกจากระบบ
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
