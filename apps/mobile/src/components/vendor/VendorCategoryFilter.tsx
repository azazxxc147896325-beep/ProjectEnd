import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface VendorCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function VendorCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: VendorCategoryFilterProps) {
  return (
    <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
      <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>
        รายการอาหารทั้งหมด
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelectCategory(cat)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: selectedCategory === cat ? '#10B981' : '#162720',
              borderWidth: 1,
              borderColor: selectedCategory === cat ? '#10B981' : '#244034',
            }}
          >
            <Text
              style={{
                color: selectedCategory === cat ? '#FFFFFF' : '#88A096',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              {cat === 'all' ? 'ทั้งหมด' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
