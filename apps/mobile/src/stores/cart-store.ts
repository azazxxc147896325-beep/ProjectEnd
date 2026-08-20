import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { MenuItem, Vendor, OrderType } from '@campus-food/shared-types';

// ---- Secure Storage Adapter for Zustand persist ----
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
      console.warn('[SecureStore] Failed to persist cart state:', err);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (err) {
      console.warn('[SecureStore] Failed to remove cart state:', err);
    }
  },
};

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  options?: Record<string, any>;
  subtotal: number;
}

interface CartState {
  vendorId: string | null;
  vendorName: string | null;
  items: CartItem[];
  orderType: OrderType;
  note: string;

  addItem: (vendor: { id: string; name: string }, item: MenuItem, quantity?: number, options?: Record<string, any>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  setOrderType: (orderType: OrderType) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      vendorId: null,
      vendorName: null,
      items: [],
      orderType: OrderType.DINE_IN,
      note: '',

  addItem: (vendor, item, quantity = 1, options) => {
    const { vendorId, items } = get();

    // If adding from a different vendor, clear existing cart
    let currentItems = items;
    if (vendorId && vendorId !== vendor.id) {
      currentItems = [];
    }

    const existingIndex = currentItems.findIndex((i) => i.menuItem.id === item.id);
    let newItems: CartItem[];

    if (existingIndex > -1) {
      newItems = [...currentItems];
      const newQty = newItems[existingIndex].quantity + quantity;
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newQty,
        subtotal: Number(item.price) * newQty,
      };
    } else {
      newItems = [
        ...currentItems,
        {
          menuItem: item,
          quantity,
          options,
          subtotal: Number(item.price) * quantity,
        },
      ];
    }

    set({
      vendorId: vendor.id,
      vendorName: vendor.name,
      items: newItems,
    });
  },

  removeItem: (menuItemId) => {
    const newItems = get().items.filter((i) => i.menuItem.id !== menuItemId);
    set({
      items: newItems,
      vendorId: newItems.length === 0 ? null : get().vendorId,
      vendorName: newItems.length === 0 ? null : get().vendorName,
    });
  },

  updateQuantity: (menuItemId, delta) => {
    const newItems = get()
      .items.map((i) => {
        if (i.menuItem.id === menuItemId) {
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...i,
            quantity: newQty,
            subtotal: Number(i.menuItem.price) * newQty,
          };
        }
        return i;
      })
      .filter((i): i is CartItem => i !== null);

    set({
      items: newItems,
      vendorId: newItems.length === 0 ? null : get().vendorId,
      vendorName: newItems.length === 0 ? null : get().vendorName,
    });
  },

  setOrderType: (orderType) => set({ orderType }),
  setNote: (note) => set({ note }),
  clearCart: () => set({ items: [], vendorId: null, vendorName: null, note: '' }),

  getTotalPrice: () => {
    return get().items.reduce((sum, i) => sum + i.subtotal, 0);
  },

  getTotalCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}),
    {
      name: 'campus-food-cart',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
