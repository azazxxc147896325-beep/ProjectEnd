import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MenuItem } from '@campus-food/shared-types';
import { Star, Plus, Minus } from 'lucide-react-native';

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
        <Star size={16} color="#FBBF24" fill="#FBBF24" />
        <Text style={{ color: '#FBBF24', fontSize: 14, fontWeight: 'bold' }}>
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
                backgroundColor: '#111E18',
                borderRadius: 18,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(245, 158, 11, 0.5)',
              }}
            >
              {item.imageUrl ? (
                <Image
                  source={{
                    uri: item.imageUrl,
                  }}
                  style={{ width: '100%', height: 100 }}
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 100,
                    backgroundColor: '#162720',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 36 }}>
                    {item.category === 'อาหารจานเดียว' ? '🍛' :
                     item.category === 'ก๋วยเตี๋ยว' ? '🍜' :
                     item.category === 'ของทานเล่น' ? '🍢' :
                     item.category === 'เครื่องดื่ม' ? '🧋' :
                     item.category === 'ของหวาน' ? '🍨' : '🍽️'}
                  </Text>
                </View>
              )}
              <View style={{ padding: 10 }}>
                <Text numberOfLines={1} style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 'bold' }}>
                  {item.name}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ color: '#8FBC7A', fontSize: 13, fontWeight: 'bold' }}>
                    ฿{Number(item.price)}
                  </Text>

                  {qty > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#162720',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#10B981',
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
                          backgroundColor: '#244034',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Minus size={12} color="#F8FAFC" />
                      </TouchableOpacity>

                      <Text
                        style={{
                          color: '#8FBC7A',
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
                          backgroundColor: '#10B981',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Plus size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onAddToCart(item)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: '#10B981',
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Plus size={12} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>ใส่ตะกร้า</Text>
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
