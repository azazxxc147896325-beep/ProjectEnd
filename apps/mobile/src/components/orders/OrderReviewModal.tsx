import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Order } from '@campus-food/shared-types';
import { Star, X } from 'lucide-react-native';

interface OrderReviewModalProps {
  isOpen: boolean;
  order: Order | null;
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function OrderReviewModal({
  isOpen,
  order,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onClose,
  onSubmit,
}: OrderReviewModalProps) {
  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#0F172A',
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: 'bold' }}>
              ให้คะแนนและรีวิวอาหาร
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 14 }}>
            {order?.vendor?.name || 'ร้านค้า'} (คิว #{order?.queueNumber})
          </Text>

          {/* Star Rating Selector */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
                <Star
                  size={32}
                  color={star <= rating ? '#FBBF24' : '#E2E8F0'}
                  fill={star <= rating ? '#FBBF24' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="เขียนความประทับใจ หรือข้อเสนอแนะเรื่องรสชาติ/ความรวดเร็ว..."
            placeholderTextColor="#94A3B8"
            value={comment}
            onChangeText={onCommentChange}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 14,
              padding: 12,
              color: '#0F172A',
              fontSize: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          />

          <TouchableOpacity
            onPress={onSubmit}
            style={{
              backgroundColor: '#0D9488',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
              shadowColor: '#0D9488',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>ส่งรีวิว</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
