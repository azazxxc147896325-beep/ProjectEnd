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
      <View style={{ height: 160, backgroundColor: '#162720' }}>
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
            backgroundColor: 'rgba(10, 17, 14, 0.5)',
          }}
        />
      </View>

      {/* Info Card */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: -30,
          backgroundColor: '#111E18',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#1E352B',
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
            {vendor.name}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: vendor.isOpen ? 'rgba(6, 78, 59, 0.85)' : 'rgba(136, 19, 55, 0.85)',
              borderWidth: 1,
              borderColor: vendor.isOpen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {vendor.isOpen ? (
              <CheckCircle2 size={11} color="#6EE7B7" />
            ) : (
              <XCircle size={11} color="#FDA4AF" />
            )}
            <Text
              style={{
                color: vendor.isOpen ? '#6EE7B7' : '#FDA4AF',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {vendor.isOpen ? 'พร้อมรับออเดอร์' : 'ปิดร้าน'}
            </Text>
          </View>
        </View>

        {vendor.description && (
          <Text style={{ color: '#88A096', fontSize: 12, marginTop: 6, lineHeight: 17 }}>
            {vendor.description}
          </Text>
        )}
      </View>
    </>
  );
}
