import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MenuItem } from '@campus-food/shared-types';
import { Plus, Minus, Check } from 'lucide-react-native';

interface VendorMenuItemCardProps {
  item: MenuItem;
  quantity: number;
  isAddedAnimation: boolean;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export function VendorMenuItemCard({
  item,
  quantity,
  isAddedAnimation,
  onAddToCart,
  onUpdateQuantity,
}: VendorMenuItemCardProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#0f172a',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: quantity > 0 ? '#f97316' : '#1e293b',
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

          {quantity > 0 ? (
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
                onPress={() => onUpdateQuantity(item.id, -1)}
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
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={() => onAddToCart(item)}
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
              onPress={() => onAddToCart(item)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: isAddedAnimation ? '#10b981' : '#f97316',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isAddedAnimation ? (
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
  );
}
