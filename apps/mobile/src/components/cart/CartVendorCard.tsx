import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Store, Trash2, ChevronRight, UtensilsCrossed } from 'lucide-react-native';
import { VendorCartGroup } from '../../stores/cart-store';
import { mobileToast } from '../../stores/toast-store';

interface CartVendorCardProps {
  group: VendorCartGroup;
  onPress: () => void;
  onClearVendor: (vendorId: string) => void;
}

export function CartVendorCard({
  group,
  onPress,
  onClearVendor,
}: CartVendorCardProps) {
  const handleConfirmClearVendor = (e: any) => {
    e?.stopPropagation?.();
    mobileToast.confirm({
      title: `ลบรายการจาก "${group.vendorName}"`,
      message: `คุณต้องการลบรายการอาหารทั้งหมด (${group.items.length} รายการ) ของร้านนี้ออกจากตะกร้าใช่หรือไม่?`,
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: () => {
        onClearVendor(group.vendorId);
        mobileToast.info(`ลบรายการร้าน ${group.vendorName} แล้ว`);
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: '#111E18',
        borderRadius: 22,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#1E352B',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Top row: Store Icon, Name, Item Count & Delete */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderWidth: 1.5,
              borderColor: 'rgba(16, 185, 129, 0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={22} color="#10B981" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>
              {group.vendorName}
            </Text>
            <Text style={{ color: '#88A096', fontSize: 12, marginTop: 2 }}>
              มีอาหาร <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{group.totalCount}</Text> รายการในร้านนี้
            </Text>
          </View>
        </View>

        {/* Delete All from this Vendor */}
        <TouchableOpacity
          onPress={handleConfirmClearVendor}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            padding: 8,
            borderRadius: 10,
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.25)',
          }}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Item preview tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {group.items.slice(0, 3).map((item) => (
          <View
            key={item.menuItem.id}
            style={{
              backgroundColor: '#162720',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: '#244034',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <UtensilsCrossed size={11} color="#8FBC7A" />
            <Text style={{ color: '#CBD5E1', fontSize: 12 }}>
              {item.menuItem.name} <Text style={{ color: '#8FBC7A', fontWeight: 'bold' }}>x{item.quantity}</Text>
            </Text>
          </View>
        ))}
        {group.items.length > 3 && (
          <View
            style={{
              backgroundColor: '#162720',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: '#244034',
            }}
          >
            <Text style={{ color: '#88A096', fontSize: 12 }}>
              +{group.items.length - 3} รายการเพิ่มเติม
            </Text>
          </View>
        )}
      </View>

      {/* Bottom row: Subtotal & CTA to enter detail view */}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: '#1E352B',
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: '#88A096', fontSize: 11 }}>ยอดรวมร้านนี้</Text>
          <Text style={{ color: '#8FBC7A', fontSize: 18, fontWeight: 'bold' }}>
            ฿{group.subtotal.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#162720',
            borderWidth: 1,
            borderColor: '#244034',
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
            gap: 4,
          }}
        >
          <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>
            ดูรายละเอียดร้านนี้
          </Text>
          <ChevronRight size={16} color="#10B981" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
