import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

/**
 * Universal Secure Storage Adapter for Zustand persist middleware.
 * Encrypts data using device-level hardware keystore (iOS Keychain / Android Keystore).
 */
export const secureStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (err) {
      console.warn(`[SecureStore] Failed to read key "${name}":`, err);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (err) {
      console.warn(`[SecureStore] Failed to persist key "${name}":`, err);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (err) {
      console.warn(`[SecureStore] Failed to remove key "${name}":`, err);
    }
  },
};
