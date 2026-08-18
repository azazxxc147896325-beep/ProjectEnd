import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Send,
  ShoppingBag,
  Store,
  RefreshCw,
  Flame,
  Soup,
  Salad,
  Coffee,
  Dice5,
  Check,
} from 'lucide-react-native';
import { mobileApi } from '../../lib/api';
import { useCartStore } from '../../stores/cart-store';
import {
  AiFoodRecommendationResponse,
  RecommendedDishItem,
  AiChatMessage,
} from '@campus-food/shared-types';

interface ExtendedMessage extends AiChatMessage {
  dishes?: RecommendedDishItem[];
}

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
        'สวัสดีครับ! 🤖 ผมคือ AI กูรูอาหารประจำแคมปัส ไม่รู้จะกินอะไรดี? บอกผมได้เลย เช่น งบประมาณ, อยากกินอะไรร้อนๆ เผ็ดๆ หรืออาหารคลีน ผมพร้อมแนะนำเมนูเด็ดจากร้านค้าจริงในโรงอาหารให้ครับ! ✨',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    { label: '🔥 งบไม่เกิน 60฿', query: 'อยากกินอาหารจานด่วน งบไม่เกิน 60 บาท', icon: Flame },
    { label: '🍜 ก๋วยเตี๋ยวแซ่บๆ', query: 'อยากกินก๋วยเตี๋ยวต้มยำร้อนๆ รสแซ่บ', icon: Soup },
    { label: '🥗 เมนูสุขภาพ/คลีน', query: 'แนะนำอาหารสุขภาพ แคลอรีต่ำ อิ่มกำลังดี', icon: Salad },
    { label: '🧋 ของหวาน/แก้ง่วง', query: 'ขอชานม กาแฟ หรือของหวานเย็นๆ ชื่นใจ', icon: Coffee },
    { label: '🎲 สุ่มเมนูเด็ดวันนี้', query: 'สุ่มเมนูเด็ดน่าทานมาให้หน่อย คิดไม่ออกเลย', icon: Dice5 },
  ];

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
      // Call backend AI recommendation endpoint
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
          'ขออภัยครับ ไม่สามารถเชื่อมต่อกับระบบ AI หรือไม่พบรายการอาหารในขณะนี้ กรุณาลองใหม่อีกครั้งครับ',
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
      style={{ flex: 1, backgroundColor: '#090d16' }}
    >
      {/* Header Banner */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#0f172a',
          borderBottomWidth: 1,
          borderColor: '#1e293b',
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
              backgroundColor: '#f97316',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#f97316',
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold' }}>
              น้องหยก AI 🤖
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>
              ผู้ช่วยค้นหาและแนะนำเมนูอาหารในมอ
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
                  'สวัสดีครับ! 🤖 แตะปุ่มลัดด้านล่างหรือพิมพ์ถามได้เลยว่าวันนี้อยากทานอะไรดีครับ ✨',
                timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          style={{
            padding: 8,
            borderRadius: 10,
            backgroundColor: '#1e293b',
          }}
        >
          <RefreshCw size={16} color="#94a3b8" />
        </TouchableOpacity>

      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
        style={{ flex: 1 }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <View
              key={msg.id}
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
                  {msg.content}
                </Text>

                {msg.timestamp && (
                  <Text
                    style={{
                      color: isUser ? 'rgba(255,255,255,0.7)' : '#64748b',
                      fontSize: 10,
                      alignSelf: 'flex-end',
                      marginTop: 4,
                    }}
                  >
                    {msg.timestamp}
                  </Text>
                )}
              </View>

              {/* Recommended Dish Cards inside AI Message */}
              {msg.dishes && msg.dishes.length > 0 && (
                <View style={{ marginTop: 12, gap: 10 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                    🍽️ เมนูที่แนะนำสำหรับคุณ:
                  </Text>
                  {msg.dishes.map((dish) => {
                    const isJustAdded = addedDishId === dish.id;
                    return (
                      <View
                        key={dish.id}
                        style={{
                          backgroundColor: '#0f172a',
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: '#334155',
                          overflow: 'hidden',
                          shadowColor: '#000',
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          elevation: 3,
                        }}
                      >
                        <View style={{ flexDirection: 'row', padding: 10, gap: 12 }}>
                          {/* Dish Image */}
                          <Image
                            source={{
                              uri:
                                dish.imageUrl ||
                                'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
                            }}
                            style={{ width: 85, height: 85, borderRadius: 12, backgroundColor: '#1e293b' }}
                            resizeMode="cover"
                          />

                          {/* Info */}
                          <View style={{ flex: 1, justifyContent: 'space-between' }}>
                            <View>
                              {dish.matchReason && (
                                <View
                                  style={{
                                    alignSelf: 'flex-start',
                                    paddingHorizontal: 7,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                                    marginBottom: 4,
                                  }}
                                >
                                  <Text style={{ color: '#fb923c', fontSize: 10, fontWeight: '700' }}>
                                    {dish.matchReason}
                                  </Text>
                                </View>
                              )}
                              <Text
                                numberOfLines={1}
                                style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}
                              >
                                {dish.name}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}
                              >
                                🏪 {dish.vendorName}
                              </Text>
                            </View>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 6,
                              }}
                            >
                              <Text style={{ color: '#f97316', fontSize: 15, fontWeight: '900' }}>
                                ฿{dish.price}
                              </Text>

                              <View style={{ flexDirection: 'row', gap: 6 }}>
                                <TouchableOpacity
                                  onPress={() => router.push(`/vendor/${dish.vendorId}`)}
                                  style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 5,
                                    borderRadius: 8,
                                    backgroundColor: '#1e293b',
                                  }}
                                >
                                  <Text style={{ color: '#cbd5e1', fontSize: 11, fontWeight: '600' }}>
                                    หน้าร้าน
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => handleAddToCart(dish)}
                                  activeOpacity={0.8}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 8,
                                    backgroundColor: isJustAdded ? '#10b981' : '#f97316',
                                  }}
                                >
                                  {isJustAdded ? (
                                    <>
                                      <Check size={12} color="#ffffff" />
                                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>
                                        ใส่แล้ว!
                                      </Text>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag size={12} color="#ffffff" />
                                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>
                                        ใส่ตะกร้า
                                      </Text>
                                    </>
                                  )}
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {loading && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderRadius: 16,
              backgroundColor: '#131d31',
              alignSelf: 'flex-start',
            }}
          >
            <ActivityIndicator size="small" color="#f97316" />
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>น้องหยกกำลังค้นหาเมนูอร่อยๆ...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompt Chips */}
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
                onPress={() => handleSend(item.query)}
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

      {/* Bottom Input Field */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderColor: '#1e293b',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <TextInput
          placeholder="ถามน้องหยกได้เลย เช่น งบ 50 บาท, ของเผ็ดๆ..."
          placeholderTextColor="#64748b"
          value={inputQuery}
          onChangeText={setInputQuery}
          onSubmitEditing={() => handleSend()}
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            borderRadius: 20,
            paddingHorizontal: 16,
            height: 42,
            color: '#f8fafc',
            fontSize: 13,
          }}
        />

        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: inputQuery.trim() && !loading ? '#f97316' : '#334155',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
