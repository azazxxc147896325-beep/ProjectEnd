import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Banknote, Soup, Salad, Coffee, Dices } from 'lucide-react-native';

interface AiQuickPromptsProps {
  onSelectPrompt: (query: string) => void;
  loading: boolean;
}

export function AiQuickPrompts({ onSelectPrompt, loading }: AiQuickPromptsProps) {
  const quickPrompts = [
    { label: 'งบประหยัด ไม่เกิน 60฿', query: 'อยากกินอาหารจานด่วน งบไม่เกิน 60 บาท', icon: Banknote },
    { label: 'ก๋วยเตี๋ยวและต้มซุป', query: 'อยากกินก๋วยเตี๋ยวต้มยำร้อนๆ หรือซุปร้อนๆ', icon: Soup },
    { label: 'อาหารสุขภาพ แคลต่ำ', query: 'แนะนำอาหารสุขภาพ แคลอรีต่ำ อิ่มกำลังดี', icon: Salad },
    { label: 'เครื่องดื่มและของหวาน', query: 'ขอชานม กาแฟ หรือของหวานเย็นๆ ชื่นใจ', icon: Coffee },
    { label: 'สุ่มเมนูยอดนิยมวันนี้', query: 'สุ่มเมนูเด็ดน่าทานมาให้หน่อย คิดไม่ออกเลย', icon: Dices },
  ];

  return (
    <View style={{ paddingVertical: 8, backgroundColor: '#0A110E' }}>
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
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 16,
                backgroundColor: '#111E18',
                borderWidth: 1,
                borderColor: '#1E352B',
              }}
            >
              <Icon size={14} color="#8FBC7A" />
              <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '600' }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
