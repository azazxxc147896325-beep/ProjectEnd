import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Store, Trash2, ArrowRight } from 'lucide-react-native';
import { VendorCartGroup } from '../../stores/cart-store';
import { OrderType } from '@campus-food/shared-types';
import { CartItemRow } from './CartItemRow';
import { CartOrderTypeSelector } from './CartOrderTypeSelector';
import { CartNoteInput } from './CartNoteInput';
import { mobileToast } from '../../stores/toast-store';

interface CartVendorGroupProps {
  group: VendorCartGroup;
  isSubmittingThisVendor: boolean;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onSelectOrderType: (vendorId: string, orderType: OrderType) => void;
  onNoteChange: (vendorId: string, note: string) => void;
  onClearVendor: (vendorId: string) => void;
  onCheckoutSingleVendor: (group: VendorCartGroup) => void;
}

export function CartVendorGroup({
  group,
  isSubmittingThisVendor,
  onUpdateQuantity,
  onSelectOrderType,
  onNoteChange,
  onClearVendor,
  onCheckoutSingleVendor,
}: CartVendorGroupProps) {
  const handleConfirmClearVendor = () => {
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
    <View
      style={{
        backgroundColor: '#111E18',
        borderRadius: 22,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#1E352B',
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Header: Store Icon, Name, Count & Delete Button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderColor: '#1E352B',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: 'rgba(143, 188, 122, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(143, 188, 122, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={20} color="#8FBC7A" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>
              {group.vendorName}
            </Text>
            <Text style={{ color: '#88A096', fontSize: 12, marginTop: 2 }}>
              {group.totalCount} รายการ • <Text style={{ color: '#8FBC7A', fontWeight: 'bold' }}>฿{group.subtotal.toLocaleString()}</Text>
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

      {/* Menu Items List */}
      <View style={{ marginBottom: 14 }}>
        {group.items.map((item, idx) => (
          <CartItemRow
            key={item.menuItem.id}
            item={item}
            isFirst={idx === 0}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </View>

      {/* Order Type Selector for this Vendor */}
      <CartOrderTypeSelector
        orderType={group.orderType}
        onSelectOrderType={(type) => onSelectOrderType(group.vendorId, type)}
      />

      {/* Note for this Vendor */}
      <CartNoteInput
        note={group.note}
        onNoteChange={(text) => onNoteChange(group.vendorId, text)}
      />

      {/* Vendor Footer: Subtotal & Single Vendor Checkout Button */}
      <View
        style={{
          marginTop: 10,
          paddingTop: 14,
          borderTopWidth: 1,
          borderColor: '#1E352B',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: '#88A096', fontSize: 11 }}>ยอดรวมร้านนี้ ({group.totalCount} จาน)</Text>
          <Text style={{ color: '#8FBC7A', fontSize: 18, fontWeight: 'bold' }}>
            ฿{group.subtotal.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onCheckoutSingleVendor(group)}
          disabled={isSubmittingThisVendor}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#10B981',
            borderRadius: 14,
            paddingVertical: 11,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 3,
            opacity: isSubmittingThisVendor ? 0.7 : 1,
          }}
        >
          {isSubmittingThisVendor ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>
                สั่งเฉพาะร้านนี้ (฿{group.subtotal.toLocaleString()})
              </Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
