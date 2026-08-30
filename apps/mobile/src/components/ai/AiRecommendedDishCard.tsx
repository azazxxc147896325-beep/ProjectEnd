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
        backgroundColor: '#111E18',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#1E352B',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', padding: 10, gap: 12 }}>
        {/* Dish Image or Icon */}
        {dish.imageUrl ? (
          <Image
            source={{
              uri: dish.imageUrl,
            }}
            style={{ width: 85, height: 85, borderRadius: 12, backgroundColor: '#162720' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 85,
              height: 85,
              borderRadius: 12,
              backgroundColor: '#162720',
              borderWidth: 1,
              borderColor: '#244034',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>🍛</Text>
            <Text style={{ color: '#88A096', fontSize: 9, marginTop: 2, fontWeight: '600' }}>ตามสั่ง</Text>
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
                  backgroundColor: 'rgba(143, 188, 122, 0.15)',
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: '#8FBC7A', fontSize: 10, fontWeight: '700' }}>
                  {dish.matchReason}
                </Text>
              </View>
            )}
            <Text numberOfLines={1} style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' }}>
              {dish.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Store size={12} color="#88A096" />
              <Text numberOfLines={1} style={{ color: '#88A096', fontSize: 11, flex: 1 }}>
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
            <Text style={{ color: '#8FBC7A', fontSize: 15, fontWeight: '900' }}>
              ฿{dish.price}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => onViewVendor(dish.vendorId)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: '#162720',
                  borderWidth: 1,
                  borderColor: '#244034',
                }}
              >
                <Text style={{ color: '#CBD5E1', fontSize: 11, fontWeight: '600' }}>หน้าร้าน</Text>
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
                  backgroundColor: isJustAdded ? '#059669' : '#10B981',
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
