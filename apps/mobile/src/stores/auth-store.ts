import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User, Role } from '@campus-food/shared-types';

// ---- Secure Storage Adapter for Zustand persist ----
// expo-secure-store encrypts data using device-level keystore (Keychain / Android Keystore).
// This ensures the JWT token survives app restarts without being exposed as plain text.
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (err) {
      console.warn('[SecureStore] Failed to persist auth state:', err);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (err) {
      console.warn('[SecureStore] Failed to remove auth state:', err);
    }
  },
};

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
  isAuthenticated: boolean;
  isHydrated: boolean; // true once SecureStore async load completes
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: () => void;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

// ---- Store ----
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `เข้าสู่ระบบไม่สำเร็จ: ${res.status}`);
        }
        const data = await res.json();
        set({ user: data.user, token: data.accessToken, isAuthenticated: true });
      },

      register: async (data: RegisterData) => {
        const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
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
          throw new Error(err.message || `สมัครสมาชิกไม่สำเร็จ: ${res.status}`);
        }
        const authData = await res.json();
        set({ user: authData.user, token: authData.accessToken, isAuthenticated: true });
      },
    }),

    {
      name: 'campus-food-auth', // Key ใน SecureStore
      storage: createJSONStorage(() => secureStorage),
      // เลือกเก็บเฉพาะ field ที่ต้องการ persist (ไม่เก็บ isHydrated)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
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
