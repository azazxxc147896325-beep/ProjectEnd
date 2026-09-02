import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Role } from '@campus-food/shared-types';
import { secureStorageAdapter } from '../lib/secure-storage-adapter';

// ---- Types ----
interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // true once SecureStore async load completes
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setHydrated: () => void;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

// ---- Store ----
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
            throw new Error(msg || `เข้าสู่ระบบไม่สำเร็จ: ${res.status}`);
          }
          const data = await res.json();
          set({
            user: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken || null,
            isAuthenticated: true,
          });
        } catch (error: any) {
          if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
            throw new Error(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (${API_BASE}) กรุณาตรวจสอบการเชื่อมต่อ Wi-Fi หรือ IP เครื่องเซิร์ฟเวอร์`);
          }
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: data.fullName.trim(),
              email: data.email.trim().toLowerCase(),
              password: data.password,
              phone: data.phone?.trim() || undefined,
              role: Role.STUDENT,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
            throw new Error(msg || `สมัครสมาชิกไม่สำเร็จ: ${res.status}`);
          }
          const authData = await res.json();
          set({
            user: authData.user,
            token: authData.accessToken,
            refreshToken: authData.refreshToken || null,
            isAuthenticated: true,
          });
        } catch (error: any) {
          if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
            throw new Error(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (${API_BASE}) กรุณาตรวจสอบการเชื่อมต่อ Wi-Fi หรือ IP เครื่องเซิร์ฟเวอร์`);
          }
          throw error;
        }
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
          const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) {
            get().logout();
            return false;
          }

          const data = await res.json();
          set({
            user: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            isAuthenticated: true,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),

    {
      name: 'campus-food-auth', // Key ใน SecureStore
      storage: createJSONStorage(() => secureStorageAdapter),
      // เลือกเก็บเฉพาะ field ที่ต้องการ persist (ไม่เก็บ isHydrated)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // ถูกเรียกหลังจากโหลดข้อมูลจาก SecureStore เสร็จแล้ว
        if (state) {
          state.setHydrated();
        }
      },
    },
  ),
);
