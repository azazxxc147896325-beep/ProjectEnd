import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Flame, Soup, Salad, Coffee, Dice5 } from 'lucide-react-native';

interface AiQuickPromptsProps {
  onSelectPrompt: (query: string) => void;
  loading: boolean;
}

export function AiQuickPrompts({ onSelectPrompt, loading }: AiQuickPromptsProps) {
  const quickPrompts = [
    { label: '🔥 งบไม่เกิน 60฿', query: 'อยากกินอาหารจานด่วน งบไม่เกิน 60 บาท', icon: Flame },
    { label: '🍜 ก๋วยเตี๋ยวแซ่บๆ', query: 'อยากกินก๋วยเตี๋ยวต้มยำร้อนๆ รสแซ่บ', icon: Soup },
    { label: '🥗 เมนูสุขภาพ/คลีน', query: 'แนะนำอาหารสุขภาพ แคลอรีต่ำ อิ่มกำลังดี', icon: Salad },
    { label: '🧋 ของหวาน/แก้ง่วง', query: 'ขอชานม กาแฟ หรือของหวานเย็นๆ ชื่นใจ', icon: Coffee },
    { label: '🎲 สุ่มเมนูเด็ดวันนี้', query: 'สุ่มเมนูเด็ดน่าทานมาให้หน่อย คิดไม่ออกเลย', icon: Dice5 },
  ];

  return (
    <View style={{ paddingVertical: 8, backgroundColor: '#090d16' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectPrompt(item.query)}
              disabled={loading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 16,
                backgroundColor: '#131d31',
                borderWidth: 1,
                borderColor: '#1e293b',
              }}
            >
              <Icon size={13} color="#f97316" />
              <Text style={{ color: '#cbd5e1', fontSize: 11, fontWeight: '600' }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
