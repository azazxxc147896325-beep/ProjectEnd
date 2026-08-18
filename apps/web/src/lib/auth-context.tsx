'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from './api';
import { User, Vendor, Role } from '@campus-food/shared-types';

interface AuthContextType {
  user: User | null;
  vendor: Vendor | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateVendorStatus: (isOpen: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadProfile = async (authToken: string) => {
    try {
      const userData = await apiClient('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(userData);
      if (userData.vendor) {
        setVendor(userData.vendor);
      } else {
        // Fetch my vendor
        try {
          const vendorData = await apiClient('/vendors/my-vendor', {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          setVendor(vendorData);
        } catch {
          // No vendor profile attached
        }
      }
    } catch (err) {
      console.error('Session expired or invalid token:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      loadProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string = 'password123') => {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);

    if (data.user.vendor) {
      setVendor(data.user.vendor);
    } else {
      await loadProfile(data.accessToken);
    }

    router.push('/dashboard/orders');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setVendor(null);
    router.push('/login');
  };

  const updateVendorStatus = async (isOpen: boolean) => {
    if (!vendor) return;
    try {
      const updated = await apiClient(`/vendors/${vendor.id}/toggle-open`, {
        method: 'PATCH',
        body: JSON.stringify({ isOpen }),
      });
      setVendor((prev) => (prev ? { ...prev, isOpen: updated.isOpen } : null));
    } catch (error) {
      console.error('Failed to toggle vendor status:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await loadProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateVendorStatus,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
