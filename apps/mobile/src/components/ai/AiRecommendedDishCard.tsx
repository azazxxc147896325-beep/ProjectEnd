import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { RecommendedDishItem } from '@campus-food/shared-types';
import { ShoppingBag, Check } from 'lucide-react-native';

interface AiRecommendedDishCardProps {
  dish: RecommendedDishItem;
  isJustAdded: boolean;
  onAddToCart: (dish: RecommendedDishItem) => void;
  onViewVendor: (vendorId: string) => void;
}

export function AiRecommendedDishCard({
  dish,
  isJustAdded,
  onAddToCart,
  onViewVendor,
}: AiRecommendedDishCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', padding: 10, gap: 12 }}>
        {/* Dish Image */}
        <Image
          source={{
            uri:
              dish.imageUrl ||
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
          }}
          style={{ width: 85, height: 85, borderRadius: 12, backgroundColor: '#1e293b' }}
          resizeMode="cover"
        />

        {/* Info */}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            {dish.matchReason && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: '#fb923c', fontSize: 10, fontWeight: '700' }}>
                  {dish.matchReason}
                </Text>
              </View>
            )}
            <Text numberOfLines={1} style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>
              {dish.name}
            </Text>
            <Text numberOfLines={1} style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
              🏪 {dish.vendorName}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <Text style={{ color: '#f97316', fontSize: 15, fontWeight: '900' }}>
              ฿{dish.price}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => onViewVendor(dish.vendorId)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: '#1e293b',
                }}
              >
                <Text style={{ color: '#cbd5e1', fontSize: 11, fontWeight: '600' }}>หน้าร้าน</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onAddToCart(dish)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: isJustAdded ? '#10b981' : '#f97316',
                }}
              >
                {isJustAdded ? (
                  <>
                    <Check size={12} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>ใส่แล้ว!</Text>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={12} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>ใส่ตะกร้า</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
