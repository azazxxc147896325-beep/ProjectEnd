import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { useCartStore } from '../../stores/cart-store';
import { MenuItem, Vendor } from '@campus-food/shared-types';
import { Sparkles, Plus, Minus, ShoppingBag, Store, ArrowLeft, Check, ChevronLeft } from 'lucide-react-native';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const { addItem, updateQuantity, items: cartItems, getTotalPrice, getTotalCount } = useCartStore();

  const getItemQuantity = (itemId: string) => {
    const found = cartItems.find((i) => i.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };


  useEffect(() => {
    async function loadVendorData() {
      try {
        if (!id) return;
        const [vData, mData] = await Promise.all([
          mobileApi<Vendor>(`/vendors/${id}`),
          mobileApi<MenuItem[]>(`/menu/vendor/${id}`),
        ]);
        setVendor(vData);
        setMenuItems(mData);
      } catch (err: any) {
        console.log('Error fetching vendor details:', err);
        setVendor(null);
        setMenuItems([]);
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลร้านค้านี้ในระบบ');
      } finally {
        setLoading(false);
      }
    }
    loadVendorData();

  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    if (!vendor) return;
    if (!vendor.isOpen) {
      Alert.alert('ร้านปิดชั่วคราว', 'ร้านนี้ปิดรับออเดอร์ในขณะนี้ครับ');
      return;
    }

    addItem({ id: vendor.id, name: vendor.name }, item, 1);
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  if (loading || !vendor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090d16' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>กำลังโหลดเมนูร้านค้า...</Text>
      </View>
    );
  }

  const dailySpecials = menuItems.filter((m) => m.isDailySpecial && m.isAvailable);
  const categories = ['all', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
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
              <ChevronLeft size={22} color="#f8fafc" />
              <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>ย้อนกลับ</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Vendor Header Banner */}
        <View style={{ height: 160, backgroundColor: '#1e293b' }}>
          <Image
            source={{
              uri: vendor.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
            }}
          />
        </View>



        {/* Vendor Info Card */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: -30,
            backgroundColor: '#0f172a',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#1e293b',
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
              {vendor.name}
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
                backgroundColor: vendor.isOpen ? 'rgba(6, 78, 59, 0.8)' : 'rgba(136, 19, 55, 0.8)',
              }}
            >
              <Text
                style={{
                  color: vendor.isOpen ? '#6ee7b7' : '#fda4af',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              >
                {vendor.isOpen ? '🟢 พร้อมรับออเดอร์' : '🔴 ปิดร้าน'}
              </Text>
            </View>
          </View>

          {vendor.description && (
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6, lineHeight: 17 }}>
              {vendor.description}
            </Text>
          )}
        </View>

        {/* Section: Daily Specials (เมนูแนะนำพิเศษประจำวัน) */}
        {dailySpecials.length > 0 && (
          <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Sparkles size={16} color="#fbbf24" />
              <Text style={{ color: '#fbbf24', fontSize: 14, fontWeight: 'bold' }}>
                เมนูพิเศษแนะนำประจำวัน (Daily Specials)
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {dailySpecials.map((item) => (
                <View
                  key={item.id}
                  style={{
                    width: 200,
                    backgroundColor: '#0f172a',
                    borderRadius: 18,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#f59e0b',
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500' }}
                    style={{ width: '100%', height: 100 }}
                  />
                  <View style={{ padding: 10 }}>
                    <Text numberOfLines={1} style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: '#f97316', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                      ฿{Number(item.price)}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <Text style={{ color: '#f97316', fontSize: 13, fontWeight: 'bold' }}>
                        ฿{Number(item.price)}
                      </Text>

                      {getItemQuantity(item.id) > 0 ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#1e293b',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#f97316',
                            paddingHorizontal: 3,
                            paddingVertical: 2,
                            gap: 6,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, -1)}
                            activeOpacity={0.7}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 8,
                              backgroundColor: '#334155',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Minus size={12} color="#f8fafc" />
                          </TouchableOpacity>

                          <Text
                            style={{
                              color: '#f97316',
                              fontSize: 12,
                              fontWeight: 'bold',
                              minWidth: 14,
                              textAlign: 'center',
                            }}
                          >
                            {getItemQuantity(item.id)}
                          </Text>

                          <TouchableOpacity
                            onPress={() => handleAddToCart(item)}
                            activeOpacity={0.7}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 8,
                              backgroundColor: '#f97316',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Plus size={12} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleAddToCart(item)}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: '#f97316',
                            borderRadius: 10,
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Plus size={12} color="#ffffff" />
                          <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>ใส่ตะกร้า</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories Bar */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>
            รายการอาหารทั้งหมด
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: selectedCategory === cat ? '#f97316' : '#1e293b',
                }}
              >
                <Text
                  style={{
                    color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items List */}
        <View style={{ marginTop: 14, paddingHorizontal: 16, gap: 12 }}>
          {filteredItems.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                backgroundColor: '#0f172a',
                borderRadius: 18,
                padding: 12,
                borderWidth: 1,
                borderColor: getItemQuantity(item.id) > 0 ? '#f97316' : '#1e293b',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Image
                source={{
                  uri: item.imageUrl || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
                }}
                style={{ width: 75, height: 75, borderRadius: 14, backgroundColor: '#1e293b' }}
              />

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text numberOfLines={1} style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
                    {item.name}
                  </Text>
                  {item.isDailySpecial && (
                    <Text style={{ color: '#fbbf24', fontSize: 10, fontWeight: 'bold' }}>⭐ แนะนำ</Text>
                  )}
                </View>

                {item.description && (
                  <Text numberOfLines={1} style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                    {item.description}
                  </Text>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ color: '#f97316', fontSize: 14, fontWeight: 'bold' }}>
                    ฿{Number(item.price)}
                  </Text>

                  {getItemQuantity(item.id) > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#1e293b',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#f97316',
                        paddingHorizontal: 4,
                        paddingVertical: 3,
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, -1)}
                        activeOpacity={0.7}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          backgroundColor: '#334155',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Minus size={13} color="#f8fafc" />
                      </TouchableOpacity>

                      <Text
                        style={{
                          color: '#f97316',
                          fontSize: 14,
                          fontWeight: 'bold',
                          minWidth: 16,
                          textAlign: 'center',
                        }}
                      >
                        {getItemQuantity(item.id)}
                      </Text>

                      <TouchableOpacity
                        onPress={() => handleAddToCart(item)}
                        activeOpacity={0.7}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          backgroundColor: '#f97316',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Plus size={13} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleAddToCart(item)}
                      activeOpacity={0.8}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        backgroundColor: addedAnimationId === item.id ? '#10b981' : '#f97316',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {addedAnimationId === item.id ? (
                        <>
                          <Check size={14} color="#ffffff" />
                          <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>เพิ่มแล้ว</Text>
                        </>
                      ) : (
                        <>
                          <Plus size={14} color="#ffffff" />
                          <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>สั่งอาหาร</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {totalCount > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            backgroundColor: '#f97316',
            borderRadius: 20,
            paddingVertical: 14,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#ffffff',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#f97316', fontSize: 12, fontWeight: 'bold' }}>{totalCount}</Text>
            </View>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
              ฿{totalPrice.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>ดูตะกร้า / ชำระเงิน</Text>
            <ShoppingBag size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
