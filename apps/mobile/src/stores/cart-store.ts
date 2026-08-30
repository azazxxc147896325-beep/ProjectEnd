import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { MenuItem, OrderType } from '@campus-food/shared-types';

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
  vendorId: string;
  vendorName: string;
  menuItem: MenuItem;
  quantity: number;
  options?: Record<string, any>;
  subtotal: number;
}

export interface VendorCartGroup {
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  orderType: OrderType;
  note: string;
  subtotal: number;
  totalCount: number;
}

export interface CartState {
  items: CartItem[];
  vendorPreferences: Record<string, { orderType?: OrderType; note?: string }>;

  // Actions
  addItem: (
    vendor: { id: string; name: string },
    item: MenuItem,
    quantity?: number,
    options?: Record<string, any>,
  ) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearVendor: (vendorId: string) => void;
  clearCart: () => void;
  setVendorOrderType: (vendorId: string, orderType: OrderType) => void;
  setVendorNote: (vendorId: string, note: string) => void;

  // Selectors / Helpers
  getVendorGroups: () => VendorCartGroup[];
  getTotalPrice: () => number;
  getTotalCount: () => number;
  getVendorTotalPrice: (vendorId: string) => number;
  getVendorTotalCount: (vendorId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      vendorPreferences: {},

      addItem: (vendor, item, quantity = 1, options) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.menuItem.id === item.id);
        let newItems: CartItem[];

        if (existingIndex > -1) {
          newItems = [...items];
          const newQty = newItems[existingIndex].quantity + quantity;
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            vendorId: vendor.id,
            vendorName: vendor.name,
            quantity: newQty,
            subtotal: Number(item.price) * newQty,
            options: options || newItems[existingIndex].options,
          };
        } else {
          newItems = [
            ...items,
            {
              vendorId: vendor.id,
              vendorName: vendor.name,
              menuItem: item,
              quantity,
              options,
              subtotal: Number(item.price) * quantity,
            },
          ];
        }

        set({ items: newItems });
      },

      removeItem: (menuItemId) => {
        const newItems = get().items.filter((i) => i.menuItem.id !== menuItemId);
        set({ items: newItems });
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

        set({ items: newItems });
      },

      clearVendor: (vendorId: string) => {
        const newItems = get().items.filter((i) => i.vendorId !== vendorId);
        const newPrefs = { ...get().vendorPreferences };
        delete newPrefs[vendorId];
        set({ items: newItems, vendorPreferences: newPrefs });
      },

      clearCart: () => set({ items: [], vendorPreferences: {} }),

      setVendorOrderType: (vendorId, orderType) => {
        set((state) => ({
          vendorPreferences: {
            ...state.vendorPreferences,
            [vendorId]: {
              ...(state.vendorPreferences[vendorId] || {}),
              orderType,
            },
          },
        }));
      },

      setVendorNote: (vendorId, note) => {
        set((state) => ({
          vendorPreferences: {
            ...state.vendorPreferences,
            [vendorId]: {
              ...(state.vendorPreferences[vendorId] || {}),
              note,
            },
          },
        }));
      },

      getVendorGroups: () => {
        const { items, vendorPreferences } = get();
        const groupMap = new Map<string, { vendorName: string; items: CartItem[] }>();

        for (const item of items) {
          const vId = item.vendorId || 'unknown';
          const vName = item.vendorName || 'ร้านอาหาร';
          if (!groupMap.has(vId)) {
            groupMap.set(vId, { vendorName: vName, items: [] });
          }
          groupMap.get(vId)!.items.push(item);
        }

        const groups: VendorCartGroup[] = [];
        groupMap.forEach((val, vId) => {
          const pref = vendorPreferences[vId] || {};
          const subtotal = val.items.reduce((s, i) => s + i.subtotal, 0);
          const totalCount = val.items.reduce((s, i) => s + i.quantity, 0);
          groups.push({
            vendorId: vId,
            vendorName: val.vendorName,
            items: val.items,
            orderType: pref.orderType || OrderType.DINE_IN,
            note: pref.note || '',
            subtotal,
            totalCount,
          });
        });

        return groups;
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.subtotal, 0);
      },

      getTotalCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getVendorTotalPrice: (vendorId: string) => {
        return get()
          .items.filter((i) => i.vendorId === vendorId)
          .reduce((sum, i) => sum + i.subtotal, 0);
      },

      getVendorTotalCount: (vendorId: string) => {
        return get()
          .items.filter((i) => i.vendorId === vendorId)
          .reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: 'campus-food-cart-multi-vendor',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
