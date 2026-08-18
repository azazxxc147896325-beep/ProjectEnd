import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { Vendor } from '@campus-food/shared-types';
import { Search, Store, Sparkles, ChevronRight, MapPin, Clock } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open'>('all');

  const fetchVendors = async () => {
    try {
      const data = await mobileApi<Vendor[]>('/vendors');
      setVendors(data);
    } catch (err) {
      console.log('Error loading vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchVendors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendors();
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || (selectedFilter === 'open' && v.isOpen);
    return matchesSearch && matchesFilter;
  });

  return (
    <View className="flex-1" style={{ flex: 1, backgroundColor: '#090d16' }}>
      {/* Top Search & Banner */}
      <View style={{ padding: 16, backgroundColor: '#0f172a', borderBottomWidth: 1, borderColor: '#1e293b' }}>
        {/* Campus Location Chip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
          <MapPin size={14} color="#f97316" />
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>
            โรงอาหารกลาง มหาวิทยาลัย (Central Canteen)
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            borderRadius: 14,
            paddingHorizontal: 12,
            height: 44,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="ค้นหาร้านอาหารหรือเมนู..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: '#f8fafc', fontSize: 13 }}
          />
        </View>

        {/* AI Food Concierge Hero Banner */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ai' as any)}
          activeOpacity={0.85}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 16,
            backgroundColor: '#1e293b',
            borderWidth: 1,
            borderColor: 'rgba(249, 115, 22, 0.35)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(249, 115, 22, 0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#f97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>
                🤔 ไม่รู้จะกินอะไรดี?
              </Text>
              <Text style={{ color: '#fb923c', fontSize: 11, fontWeight: '500' }}>
                แตะให้น้องหยก AI ช่วยคิดและสุ่มเมนูเด็ดเลย ✨
              </Text>

            </View>
          </View>
          <ChevronRight size={16} color="#f97316" />
        </TouchableOpacity>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>

          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selectedFilter === 'all' ? '#f97316' : '#1e293b',
            }}
          >
            <Text
              style={{
                color: selectedFilter === 'all' ? '#ffffff' : '#94a3b8',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              ร้านทั้งหมด
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('open')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selectedFilter === 'open' ? '#f97316' : '#1e293b',
            }}
          >
            <Text
              style={{
                color: selectedFilter === 'open' ? '#ffffff' : '#94a3b8',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              🟢 เปิดรับออเดอร์ตอนนี้
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vendors List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>กำลังโหลดรายชื่อร้านค้า...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Store size={40} color="#334155" />
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>
                ไม่พบร้านค้าที่ตรงกับคำค้นหา
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/vendor/${item.id}`)}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#1e293b',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {/* Cover Image */}
              <View style={{ height: 130, width: '100%', backgroundColor: '#1e293b' }}>
                <Image
                  source={{
                    uri:
                      item.logoUrl ||
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
                  }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: item.isOpen ? 'rgba(6, 78, 59, 0.85)' : 'rgba(136, 19, 55, 0.85)',
                    borderWidth: 1,
                    borderColor: item.isOpen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
                  }}
                >
                  <Text
                    style={{
                      color: item.isOpen ? '#6ee7b7' : '#fda4af',
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  >
                    {item.isOpen ? '🟢 เปิดอยู่' : '🔴 ปิดชั่วคราว'}
                  </Text>
                </View>
              </View>

              {/* Vendor Info */}
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: 'bold', flex: 1 }}>
                    {item.name}
                  </Text>
                  <ChevronRight size={18} color="#64748b" />
                </View>

                {item.description && (
                  <Text
                    numberOfLines={2}
                    style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 17 }}
                  >
                    {item.description}
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderColor: '#1e293b',
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#f97316" />
                    <Text style={{ color: '#cbd5e1', fontSize: 11 }}>รับออเดอร์ไว</Text>
                  </View>
                  <Text style={{ color: '#475569', fontSize: 10 }}>•</Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 11 }}>สั่งล่วงหน้าไม่ต้องต่อคิว</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
