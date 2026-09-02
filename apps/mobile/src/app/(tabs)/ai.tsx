import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, RefreshCw } from 'lucide-react-native';
import { mobileApi } from '../../lib/api';
import { useCartStore } from '../../stores/cart-store';
import {
  AiFoodRecommendationResponse,
  RecommendedDishItem,
} from '@campus-food/shared-types';
import {
  AiChatMessageItem,
  AiQuickPrompts,
  AiInputBar,
  ExtendedMessage,
} from '../../components/ai';

export default function AiRecommendScreen() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedDishId, setAddedDishId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'สวัสดีค่ะ! หนูคือ AI น้องหยก ผู้ช่วยแนะนำอาหารประจำโรงอาหาร วันนี้อยากทานเมนูแบบไหน งบประมาณเท่าไหร่ หรือต้องการให้น้องหยกช่วยสุ่มเมนูเด็ด แจ้งได้เลยนะคะ ✨',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: ExtendedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const result = await mobileApi<AiFoodRecommendationResponse>('/ai/recommend-food', {
        method: 'POST',
        body: JSON.stringify({
          query: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const aiMsg: ExtendedMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        dishes: result.recommendedDishes,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.log('AI Error:', err);
      const fallbackMsg: ExtendedMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content:
          'ขออภัยนะคะ ไม่สามารถเชื่อมต่อกับระบบ AI หรือไม่พบรายการอาหารในขณะนี้ กรุณาลองใหม่อีกครั้งนะคะ',
        dishes: [],
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (dish: RecommendedDishItem) => {
    addItem(
      { id: dish.vendorId, name: dish.vendorName },
      {
        id: dish.id,
        vendorId: dish.vendorId,
        name: dish.name,
        category: dish.category,
        price: dish.price,
        description: dish.description || '',
        imageUrl: dish.imageUrl || '',
        isDailySpecial: false,
        isAvailable: true,
      },
      1,
    );

    setAddedDishId(dish.id);
    setTimeout(() => setAddedDishId(null), 2000);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, loading]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={85}
      style={{ flex: 1, backgroundColor: '#F0FDFA' }}
    >
      {/* Header Banner */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderColor: '#E2E8F0',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#0D9488',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#0D9488',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Bot size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: 'bold' }}>
              AI น้องหยก
            </Text>
            <Text style={{ color: '#475569', fontSize: 11 }}>
              ผู้ช่วยค้นหาและแนะนำเมนูอาหารในโรงอาหาร
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content:
                  'สวัสดีค่ะ! แตะปุ่มลัดด้านล่างหรือพิมพ์ถามได้เลยว่าวันนี้อยากทานอะไรดีคะ ✨',
                timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          style={{
            padding: 8,
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <RefreshCw size={16} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
        style={{ flex: 1 }}
      >
        {messages.map((msg) => (
          <AiChatMessageItem
            key={msg.id}
            message={msg}
            addedDishId={addedDishId}
            onAddToCart={handleAddToCart}
            onViewVendor={(vendorId) => router.push(`/vendor/${vendorId}`)}
          />
        ))}

        {loading && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              alignSelf: 'flex-start',
            }}
          >
            <ActivityIndicator size="small" color="#0D9488" />
            <Text style={{ color: '#475569', fontSize: 12 }}>น้องหยกกำลังค้นหาเมนูที่เหมาะกับคุณให้ค่ะ...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompt Chips Subcomponent */}
      <AiQuickPrompts onSelectPrompt={handleSend} loading={loading} />

      {/* Bottom Input Field Subcomponent */}
      <AiInputBar
        inputQuery={inputQuery}
        onInputChange={setInputQuery}
        onSend={() => handleSend()}
        loading={loading}
      />
    </KeyboardAvoidingView>
  );
}
