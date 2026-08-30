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
            backgroundColor: '#111E18',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#1E352B',
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
            <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' }}>
              ให้คะแนนและรีวิวอาหาร
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#88A096" />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#88A096', fontSize: 12, marginBottom: 14 }}>
            {order?.vendor?.name || 'ร้านค้า'} (คิว #{order?.queueNumber})
          </Text>

          {/* Star Rating Selector */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
                <Star
                  size={32}
                  color={star <= rating ? '#FBBF24' : '#244034'}
                  fill={star <= rating ? '#FBBF24' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="เขียนความประทับใจ หรือข้อเสนอแนะเรื่องรสชาติ/ความรวดเร็ว..."
            placeholderTextColor="#6E8B7E"
            value={comment}
            onChangeText={onCommentChange}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#162720',
              borderRadius: 14,
              padding: 12,
              color: '#F8FAFC',
              fontSize: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#244034',
            }}
          />

          <TouchableOpacity
            onPress={onSubmit}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>ส่งรีวิว</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
