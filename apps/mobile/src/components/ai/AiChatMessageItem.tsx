import React from 'react';
import { View, Text } from 'react-native';
import { AiChatMessage, RecommendedDishItem } from '@campus-food/shared-types';
import { AiRecommendedDishCard } from './AiRecommendedDishCard';

export interface ExtendedMessage extends AiChatMessage {
  dishes?: RecommendedDishItem[];
}

interface AiChatMessageItemProps {
  message: ExtendedMessage;
  addedDishId: string | null;
  onAddToCart: (dish: RecommendedDishItem) => void;
  onViewVendor: (vendorId: string) => void;
}

export function AiChatMessageItem({
  message,
  addedDishId,
  onAddToCart,
  onViewVendor,
}: AiChatMessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isUser ? '85%' : '94%',
      }}
    >
      {/* Chat Bubble */}
      <View
        style={{
          backgroundColor: isUser ? '#f97316' : '#131d31',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 20,
          borderTopRightRadius: isUser ? 4 : 20,
          borderTopLeftRadius: !isUser ? 4 : 20,
          borderWidth: isUser ? 0 : 1,
          borderColor: '#1e293b',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: isUser ? '#ffffff' : '#e2e8f0',
            fontSize: 14,
            lineHeight: 21,
            fontWeight: isUser ? '500' : '400',
          }}
        >
          {message.content}
        </Text>

        {message.timestamp && (
          <Text
            style={{
              color: isUser ? 'rgba(255,255,255,0.7)' : '#64748b',
              fontSize: 10,
              alignSelf: 'flex-end',
              marginTop: 4,
            }}
          >
            {message.timestamp}
          </Text>
        )}
      </View>

      {/* Recommended Dish Cards */}
      {message.dishes && message.dishes.length > 0 && (
        <View style={{ marginTop: 12, gap: 10 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
            🍽️ เมนูที่แนะนำสำหรับคุณ:
          </Text>
          {message.dishes.map((dish) => (
            <AiRecommendedDishCard
              key={dish.id}
              dish={dish}
              isJustAdded={addedDishId === dish.id}
              onAddToCart={onAddToCart}
              onViewVendor={onViewVendor}
            />
          ))}
        </View>
      )}
    </View>
  );
}
