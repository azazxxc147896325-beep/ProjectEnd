import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { mobileApi } from '../../lib/api';
import { Vendor } from '@campus-food/shared-types';
import {
  Search,
  Store,
  Bot,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open'>('all');

  const fetchVendors = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) setRefreshing(true);
      const res = await mobileApi<any>('/vendors');
      const vendorList = Array.isArray(res) ? res : res?.data || [];
      setVendors(vendorList);
    } catch (err) {
      console.log('Error loading vendors:', err);
      if (!isPullToRefresh) setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVendors();
    }, [fetchVendors])
  );

  const onRefresh = () => {
    fetchVendors(true);
  };

  const safeVendors = Array.isArray(vendors) ? vendors : [];

  const filteredVendors = safeVendors.filter((v) => {
    if (!v) return false;
    const matchesSearch =
      (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || (selectedFilter === 'open' && v.isOpen);
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0A110E' }}>
      {/* Top Search & Banner */}
      <View style={{ padding: 16, backgroundColor: '#111E18', borderBottomWidth: 1, borderColor: '#1E352B' }}>
        {/* Campus Location Chip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
          <MapPin size={14} color="#8FBC7A" />
          <Text style={{ color: '#88A096', fontSize: 12, fontWeight: '600' }}>
            โรงอาหารกลาง มหาวิทยาลัย (Central Canteen)
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#162720',
            borderRadius: 14,
            paddingHorizontal: 12,
            height: 44,
            borderWidth: 1,
            borderColor: '#244034',
          }}
        >
          <Search size={18} color="#6E8B7E" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="ค้นหาร้านอาหารหรือเมนู..."
            placeholderTextColor="#6E8B7E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: '#F8FAFC', fontSize: 13 }}
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
            backgroundColor: '#162720',
            borderWidth: 1,
            borderColor: 'rgba(143, 188, 122, 0.35)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(143, 188, 122, 0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={20} color="#8FBC7A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 'bold' }}>
                ผู้ช่วย AI แนะนำอาหาร
              </Text>
              <Text style={{ color: '#8FBC7A', fontSize: 11, fontWeight: '500' }}>
                ค้นหาเมนูตามงบประมาณ หรือสุ่มเมนูเด็ดประจำวัน
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="#8FBC7A" />
        </TouchableOpacity>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selectedFilter === 'all' ? '#10B981' : '#162720',
              borderWidth: 1,
              borderColor: selectedFilter === 'all' ? '#10B981' : '#244034',
            }}
          >
            <Text
              style={{
                color: selectedFilter === 'all' ? '#FFFFFF' : '#88A096',
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
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selectedFilter === 'open' ? '#10B981' : '#162720',
              borderWidth: 1,
              borderColor: selectedFilter === 'open' ? '#10B981' : '#244034',
            }}
          >
            <CheckCircle2
              size={12}
              color={selectedFilter === 'open' ? '#FFFFFF' : '#10B981'}
            />
            <Text
              style={{
                color: selectedFilter === 'open' ? '#FFFFFF' : '#88A096',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              เปิดรับออเดอร์ตอนนี้
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vendors List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8FBC7A" />
          <Text style={{ color: '#88A096', fontSize: 12, marginTop: 8 }}>กำลังโหลดรายชื่อร้านค้า...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8FBC7A" />
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Store size={40} color="#244034" />
              <Text style={{ color: '#88A096', fontSize: 13, marginTop: 12 }}>
                ไม่พบร้านค้าที่ตรงกับคำค้นหา
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/vendor/${item.id}`)}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#111E18',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#1E352B',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {/* Cover Image */}
              <View style={{ height: 130, width: '100%', backgroundColor: '#162720' }}>
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
                    backgroundColor: item.isOpen ? 'rgba(6, 78, 59, 0.9)' : 'rgba(136, 19, 55, 0.9)',
                    borderWidth: 1,
                    borderColor: item.isOpen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {item.isOpen ? (
                    <CheckCircle2 size={11} color="#6EE7B7" />
                  ) : (
                    <XCircle size={11} color="#FDA4AF" />
                  )}
                  <Text
                    style={{
                      color: item.isOpen ? '#6EE7B7' : '#FDA4AF',
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  >
                    {item.isOpen ? 'เปิดรับออเดอร์' : 'ปิดชั่วคราว'}
                  </Text>
                </View>
              </View>

              {/* Vendor Info */}
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', flex: 1 }}>
                    {item.name}
                  </Text>
                  <ChevronRight size={18} color="#6E8B7E" />
                </View>

                {item.description && (
                  <Text
                    numberOfLines={2}
                    style={{ color: '#88A096', fontSize: 12, marginTop: 4, lineHeight: 17 }}
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
                    borderColor: '#1E352B',
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#8FBC7A" />
                    <Text style={{ color: '#CBD5E1', fontSize: 11 }}>รับออเดอร์ไว</Text>
                  </View>
                  <Text style={{ color: '#244034', fontSize: 10 }}>•</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 11 }}>สั่งล่วงหน้าไม่ต้องรอคิว</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
