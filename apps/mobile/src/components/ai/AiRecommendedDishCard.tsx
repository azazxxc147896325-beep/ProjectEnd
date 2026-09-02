import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { RecommendedDishItem } from '@campus-food/shared-types';
import { ShoppingBag, Check, Store } from 'lucide-react-native';

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
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', padding: 10, gap: 12 }}>
        {/* Dish Image or Icon */}
        {dish.imageUrl ? (
          <Image
            source={{
              uri: dish.imageUrl,
            }}
            style={{ width: 85, height: 85, borderRadius: 12, backgroundColor: '#F1F5F9' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 85,
              height: 85,
              borderRadius: 12,
              backgroundColor: '#CCFBF1',
              borderWidth: 1,
              borderColor: '#99F6E4',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>🍛</Text>
            <Text style={{ color: '#0F766E', fontSize: 9, marginTop: 2, fontWeight: '600' }}>ตามสั่ง</Text>
          </View>
        )}

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
                  backgroundColor: '#CCFBF1',
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: '#0D9488', fontSize: 10, fontWeight: '700' }}>
                  {dish.matchReason}
                </Text>
              </View>
            )}
            <Text numberOfLines={1} style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold' }}>
              {dish.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Store size={12} color="#94A3B8" />
              <Text numberOfLines={1} style={{ color: '#475569', fontSize: 11, flex: 1 }}>
                {dish.vendorName}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <Text style={{ color: '#0D9488', fontSize: 15, fontWeight: '900' }}>
              ฿{dish.price}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => onViewVendor(dish.vendorId)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: '#F8FAFC',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <Text style={{ color: '#475569', fontSize: 11, fontWeight: '600' }}>หน้าร้าน</Text>
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
                  backgroundColor: isJustAdded ? '#059669' : '#0D9488',
                }}
              >
                {isJustAdded ? (
                  <>
                    <Check size={12} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>ใส่แล้ว</Text>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={12} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>ใส่ตะกร้า</Text>
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
