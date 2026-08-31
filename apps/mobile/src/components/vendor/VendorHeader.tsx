import React from 'react';
import { View, Text, Image } from 'react-native';
import { Vendor } from '@campus-food/shared-types';
import { CheckCircle2, XCircle } from 'lucide-react-native';

interface VendorHeaderProps {
  vendor: Vendor;
}

export function VendorHeader({ vendor }: VendorHeaderProps) {
  return (
    <>
      {/* Banner */}
      <View style={{ height: 160, backgroundColor: '#E0F2FE' }}>
        <Image
          source={{
            uri: vendor.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
          }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.25)',
          }}
        />
      </View>

      {/* Info Card */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: -30,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          shadowColor: '#0F172A',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
            {vendor.name}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: vendor.isOpen ? '#F0FDF4' : '#FEF2F2',
              borderWidth: 1,
              borderColor: vendor.isOpen ? '#BBF7D0' : '#FECACA',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {vendor.isOpen ? (
              <CheckCircle2 size={11} color="#16A34A" />
            ) : (
              <XCircle size={11} color="#DC2626" />
            )}
            <Text
              style={{
                color: vendor.isOpen ? '#16A34A' : '#DC2626',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {vendor.isOpen ? 'พร้อมรับออเดอร์' : 'ปิดร้าน'}
            </Text>
          </View>
        </View>

        {vendor.description && (
          <Text style={{ color: '#64748B', fontSize: 12, marginTop: 6, lineHeight: 17 }}>
            {vendor.description}
          </Text>
        )}
      </View>
    </>
  );
}
