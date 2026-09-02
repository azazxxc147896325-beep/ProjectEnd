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
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
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
              backgroundColor: '#CCFBF1',
              borderWidth: 1,
              borderColor: '#99F6E4',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={22} color="#0D9488" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>
              {group.vendorName}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
              มีอาหาร <Text style={{ color: '#0F172A', fontWeight: 'bold' }}>{group.totalCount}</Text> รายการในร้านนี้
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
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Item preview tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {group.items.slice(0, 3).map((item) => (
          <View
            key={item.menuItem.id}
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <UtensilsCrossed size={11} color="#0D9488" />
            <Text style={{ color: '#334155', fontSize: 12 }}>
              {item.menuItem.name} <Text style={{ color: '#0D9488', fontWeight: 'bold' }}>x{item.quantity}</Text>
            </Text>
          </View>
        ))}
        {group.items.length > 3 && (
          <View
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <Text style={{ color: '#64748B', fontSize: 12 }}>
              +{group.items.length - 3} รายการเพิ่มเติม
            </Text>
          </View>
        )}
      </View>

      {/* Bottom row: Subtotal & CTA to enter detail view */}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: '#F1F5F9',
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: '#64748B', fontSize: 11 }}>ยอดรวมร้านนี้</Text>
          <Text style={{ color: '#0D9488', fontSize: 18, fontWeight: 'bold' }}>
            ฿{group.subtotal.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#CCFBF1',
            borderWidth: 1,
            borderColor: '#99F6E4',
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
            gap: 4,
          }}
        >
          <Text style={{ color: '#0D9488', fontSize: 12, fontWeight: 'bold' }}>
            ดูรายละเอียดร้านนี้
          </Text>
          <ChevronRight size={16} color="#0D9488" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
