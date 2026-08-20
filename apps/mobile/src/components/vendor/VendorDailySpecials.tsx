import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MenuItem } from '@campus-food/shared-types';
import { Sparkles, Plus, Minus } from 'lucide-react-native';

interface VendorDailySpecialsProps {
  dailySpecials: MenuItem[];
  getItemQuantity: (itemId: string) => number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export function VendorDailySpecials({
  dailySpecials,
  getItemQuantity,
  onAddToCart,
  onUpdateQuantity,
}: VendorDailySpecialsProps) {
  if (dailySpecials.length === 0) return null;

  return (
    <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Sparkles size={16} color="#fbbf24" />
        <Text style={{ color: '#fbbf24', fontSize: 14, fontWeight: 'bold' }}>
          เมนูพิเศษแนะนำประจำวัน (Daily Specials)
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {dailySpecials.map((item) => {
          const qty = getItemQuantity(item.id);

          return (
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
                source={{
                  uri: item.imageUrl || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
                }}
                style={{ width: '100%', height: 100 }}
              />
              <View style={{ padding: 10 }}>
                <Text numberOfLines={1} style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>
                  {item.name}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ color: '#f97316', fontSize: 13, fontWeight: 'bold' }}>
                    ฿{Number(item.price)}
                  </Text>

                  {qty > 0 ? (
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
                        onPress={() => onUpdateQuantity(item.id, -1)}
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
                        {qty}
                      </Text>

                      <TouchableOpacity
                        onPress={() => onAddToCart(item)}
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
                      onPress={() => onAddToCart(item)}
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
          );
        })}
      </ScrollView>
    </View>
  );
}
