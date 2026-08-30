import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MenuItem } from '@campus-food/shared-types';
import { Plus, Minus, Check, Star } from 'lucide-react-native';

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
        backgroundColor: '#111E18',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: quantity > 0 ? '#10B981' : '#1E352B',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {item.imageUrl ? (
        <Image
          source={{
            uri: item.imageUrl,
          }}
          style={{ width: 75, height: 75, borderRadius: 14, backgroundColor: '#162720' }}
        />
      ) : (
        <View
          style={{
            width: 75,
            height: 75,
            borderRadius: 14,
            backgroundColor: '#162720',
            borderWidth: 1,
            borderColor: '#244034',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 28 }}>
            {item.category === 'อาหารจานเดียว' ? '🍛' :
             item.category === 'ก๋วยเตี๋ยว' ? '🍜' :
             item.category === 'ของทานเล่น' ? '🍢' :
             item.category === 'เครื่องดื่ม' ? '🧋' :
             item.category === 'ของหวาน' ? '🍨' : '🍽️'}
          </Text>
          <Text style={{ color: '#88A096', fontSize: 9, marginTop: 2, fontWeight: '600' }}>
            ตามสั่ง
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text numberOfLines={1} style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
            {item.name}
          </Text>
          {item.isDailySpecial && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Star size={10} color="#FBBF24" fill="#FBBF24" />
              <Text style={{ color: '#FBBF24', fontSize: 10, fontWeight: 'bold' }}>แนะนำ</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text numberOfLines={1} style={{ color: '#88A096', fontSize: 11, marginTop: 2 }}>
            {item.description}
          </Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ color: '#8FBC7A', fontSize: 14, fontWeight: 'bold' }}>
            ฿{Number(item.price)}
          </Text>

          {quantity > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#162720',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#10B981',
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
                  backgroundColor: '#244034',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Minus size={13} color="#F8FAFC" />
              </TouchableOpacity>

              <Text
                style={{
                  color: '#8FBC7A',
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
                  backgroundColor: '#10B981',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Plus size={13} color="#FFFFFF" />
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
                backgroundColor: isAddedAnimation ? '#059669' : '#10B981',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isAddedAnimation ? (
                <>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>เพิ่มแล้ว</Text>
                </>
              ) : (
                <>
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>สั่งอาหาร</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
