import React from 'react';
import { View, Text, Image } from 'react-native';
import { Vendor } from '@campus-food/shared-types';

interface VendorHeaderProps {
  vendor: Vendor;
}

export function VendorHeader({ vendor }: VendorHeaderProps) {
  return (
    <>
      {/* Banner */}
      <View style={{ height: 160, backgroundColor: '#1e293b' }}>
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
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
          }}
        />
      </View>

      {/* Info Card */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: -30,
          backgroundColor: '#0f172a',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#1e293b',
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
            {vendor.name}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: vendor.isOpen ? 'rgba(6, 78, 59, 0.8)' : 'rgba(136, 19, 55, 0.8)',
            }}
          >
            <Text
              style={{
                color: vendor.isOpen ? '#6ee7b7' : '#fda4af',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {vendor.isOpen ? '🟢 พร้อมรับออเดอร์' : '🔴 ปิดร้าน'}
            </Text>
          </View>
        </View>

        {vendor.description && (
          <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6, lineHeight: 17 }}>
            {vendor.description}
          </Text>
        )}
      </View>
    </>
  );
}
