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
    <View style={{ flex: 1, backgroundColor: '#F0F7FF' }}>
      {/* Top Search & Banner */}
      <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' }}>
        {/* Campus Location Chip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
          <MapPin size={14} color="#0284C7" />
          <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>
            โรงอาหารกลาง มหาวิทยาลัย (Central Canteen)
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            paddingHorizontal: 12,
            height: 44,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="ค้นหาร้านอาหารหรือเมนู..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: '#0F172A', fontSize: 13 }}
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
            backgroundColor: '#F0F9FF',
            borderWidth: 1,
            borderColor: '#BAE6FD',
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
                backgroundColor: '#E0F2FE',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={20} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
                ผู้ช่วย AI แนะนำอาหาร
              </Text>
              <Text style={{ color: '#0369A1', fontSize: 11, fontWeight: '500' }}>
                ค้นหาเมนูตามงบประมาณ หรือสุ่มเมนูเด็ดประจำวัน
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="#0284C7" />
        </TouchableOpacity>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selectedFilter === 'all' ? '#0284C7' : '#F8FAFC',
              borderWidth: 1,
              borderColor: selectedFilter === 'all' ? '#0284C7' : '#E2E8F0',
            }}
          >
            <Text
              style={{
                color: selectedFilter === 'all' ? '#FFFFFF' : '#64748B',
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
              backgroundColor: selectedFilter === 'open' ? '#0284C7' : '#F8FAFC',
              borderWidth: 1,
              borderColor: selectedFilter === 'open' ? '#0284C7' : '#E2E8F0',
            }}
          >
            <CheckCircle2
              size={12}
              color={selectedFilter === 'open' ? '#FFFFFF' : '#16A34A'}
            />
            <Text
              style={{
                color: selectedFilter === 'open' ? '#FFFFFF' : '#64748B',
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
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={{ color: '#64748B', fontSize: 12, marginTop: 8 }}>กำลังโหลดรายชื่อร้านค้า...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284C7" />
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Store size={40} color="#CBD5E1" />
              <Text style={{ color: '#64748B', fontSize: 13, marginTop: 12 }}>
                ไม่พบร้านค้าที่ตรงกับคำค้นหา
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/vendor/${item.id}`)}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                overflow: 'hidden',
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Cover Image */}
              <View style={{ height: 130, width: '100%', backgroundColor: '#F1F5F9' }}>
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
                    backgroundColor: item.isOpen ? '#F0FDF4' : '#FEF2F2',
                    borderWidth: 1,
                    borderColor: item.isOpen ? '#BBF7D0' : '#FECACA',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {item.isOpen ? (
                    <CheckCircle2 size={11} color="#16A34A" />
                  ) : (
                    <XCircle size={11} color="#DC2626" />
                  )}
                  <Text
                    style={{
                      color: item.isOpen ? '#16A34A' : '#DC2626',
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
                  <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: 'bold', flex: 1 }}>
                    {item.name}
                  </Text>
                  <ChevronRight size={18} color="#94A3B8" />
                </View>

                {item.description && (
                  <Text
                    numberOfLines={2}
                    style={{ color: '#64748B', fontSize: 12, marginTop: 4, lineHeight: 17 }}
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
                    borderColor: '#F1F5F9',
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#0284C7" />
                    <Text style={{ color: '#475569', fontSize: 11 }}>รับออเดอร์ไว</Text>
                  </View>
                  <Text style={{ color: '#CBD5E1', fontSize: 10 }}>•</Text>
                  <Text style={{ color: '#475569', fontSize: 11 }}>สั่งล่วงหน้าไม่ต้องรอคิว</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
