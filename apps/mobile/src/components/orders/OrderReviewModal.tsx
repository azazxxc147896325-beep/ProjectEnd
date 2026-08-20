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
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#0f172a',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#1e293b',
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
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: 'bold' }}>
              ให้คะแนนและรีวิวอาหาร
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 14 }}>
            {order?.vendor?.name || 'ร้านค้า'} (คิว #{order?.queueNumber})
          </Text>

          {/* Star Rating Selector */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
                <Star
                  size={32}
                  color={star <= rating ? '#fbbf24' : '#334155'}
                  fill={star <= rating ? '#fbbf24' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="เขียนความประทับใจ หรือข้อเสนอแนะเรื่องรสชาติ/ความรวดเร็ว..."
            placeholderTextColor="#64748b"
            value={comment}
            onChangeText={onCommentChange}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 14,
              padding: 12,
              color: '#f8fafc',
              fontSize: 12,
              marginBottom: 16,
            }}
          />

          <TouchableOpacity
            onPress={onSubmit}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>ส่งรีวิว</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
