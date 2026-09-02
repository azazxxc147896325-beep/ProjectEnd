import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { useCartStore } from '../../stores/cart-store';
import { mobileToast } from '../../stores/toast-store';
import { MenuItem, Vendor } from '@campus-food/shared-types';
import { ChevronLeft } from 'lucide-react-native';
import {
  VendorHeader,
  VendorDailySpecials,
  VendorCategoryFilter,
  VendorMenuItemCard,
  VendorFloatingCartBar,
} from '../../components/vendor';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const { addItem, updateQuantity, items: cartItems, getTotalPrice, getTotalCount } = useCartStore();

  const getItemQuantity = (itemId: string) => {
    const found = cartItems.find((i) => i.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  const loadVendorData = useCallback(async (isPullToRefresh = false) => {
    try {
      if (!id) return;
      if (isPullToRefresh) setRefreshing(true);

      const [vData, mData] = await Promise.all([
        mobileApi<Vendor>(`/vendors/${id}`),
        mobileApi<MenuItem[]>(`/menu/vendor/${id}`),
      ]);
      setVendor(vData);
      setMenuItems(Array.isArray(mData) ? mData : (mData as any)?.data || []);
    } catch (err: any) {
      console.log('Error fetching vendor details:', err);
      if (!isPullToRefresh) {
        setVendor(null);
        setMenuItems([]);
        mobileToast.error('ข้อผิดพลาด', 'ไม่พบข้อมูลร้านค้านี้ในระบบ');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadVendorData();
    }, [loadVendorData])
  );

  const handleAddToCart = (item: MenuItem) => {
    if (!vendor) return;
    if (!vendor.isOpen) {
      mobileToast.warning('ร้านปิดชั่วคราว', 'ร้านนี้ปิดรับออเดอร์ในขณะนี้ครับ');
      return;
    }

    addItem({ id: vendor.id, name: vendor.name }, item, 1);
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
    mobileToast.success(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`, `฿${Number(item.price)} บาท`);
  };

  if (loading || !vendor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDFA' }}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 8 }}>กำลังโหลดเมนูร้านค้า...</Text>
      </View>
    );
  }

  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const dailySpecials = safeMenuItems.filter((m) => m && m.isDailySpecial && m.isAvailable);
  const categories = ['all', ...Array.from(new Set(safeMenuItems.map((m) => m?.category).filter(Boolean)))];

  const filteredItems = safeMenuItems.filter((item) => {
    if (!item) return false;
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  return (
    <View style={{ flex: 1, backgroundColor: '#F0FDFA' }}>
      <Stack.Screen
        options={{
          title: vendor.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 6,
                paddingRight: 12,
              }}
            >
              <ChevronLeft size={22} color="#0F172A" />
              <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold' }}>ย้อนกลับ</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadVendorData(true)}
            tintColor="#0D9488"
            colors={['#0D9488']}
          />
        }
      >
        {/* Vendor Header Banner & Info Subcomponent */}
        <VendorHeader vendor={vendor} />

        {/* Section: Daily Specials Subcomponent */}
        <VendorDailySpecials
          dailySpecials={dailySpecials}
          getItemQuantity={getItemQuantity}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={(itemId, delta) => updateQuantity(itemId, delta)}
        />

        {/* Categories Filter Bar Subcomponent */}
        <VendorCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Menu Items List Subcomponent */}
        <View style={{ marginTop: 14, paddingHorizontal: 16, gap: 12 }}>
          {filteredItems.map((item) => (
            <VendorMenuItemCard
              key={item.id}
              item={item}
              quantity={getItemQuantity(item.id)}
              isAddedAnimation={addedAnimationId === item.id}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={(itemId, delta) => updateQuantity(itemId, delta)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar Subcomponent */}
      <VendorFloatingCartBar
        totalCount={totalCount}
        totalPrice={totalPrice}
        onPress={() => router.push('/(tabs)/cart')}
      />
    </View>
  );
}
