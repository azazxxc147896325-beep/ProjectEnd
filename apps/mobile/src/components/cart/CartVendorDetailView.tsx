import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Store, ArrowLeft, Trash2, ArrowRight } from 'lucide-react-native';
import { VendorCartGroup } from '../../stores/cart-store';
import { OrderType, PaymentMethod } from '@campus-food/shared-types';
import { CartItemRow } from './CartItemRow';
import { CartOrderTypeSelector } from './CartOrderTypeSelector';
import { CartPaymentMethodSelector } from './CartPaymentMethodSelector';
import { CartNoteInput } from './CartNoteInput';
import { mobileToast } from '../../stores/toast-store';

interface CartVendorDetailViewProps {
  group: VendorCartGroup;
  isSubmitting: boolean;
  onBack: () => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onSelectOrderType: (vendorId: string, orderType: OrderType) => void;
  onSelectPaymentMethod: (vendorId: string, paymentMethod: PaymentMethod) => void;
  onNoteChange: (vendorId: string, note: string) => void;
  onClearVendor: (vendorId: string) => void;
  onCheckout: (group: VendorCartGroup) => void;
}

export function CartVendorDetailView({
  group,
  isSubmitting,
  onBack,
  onUpdateQuantity,
  onSelectOrderType,
  onSelectPaymentMethod,
  onNoteChange,
  onClearVendor,
  onCheckout,
}: CartVendorDetailViewProps) {
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
        onBack();
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F7FF' }}>
      {/* Top Navigation Bar with Back Button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <ArrowLeft size={16} color="#0284C7" />
          <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
            ร้านค้าทั้งหมด
          </Text>
        </TouchableOpacity>

        {/* Delete All from this Vendor */}
        <TouchableOpacity
          onPress={handleConfirmClearVendor}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
        >
          <Trash2 size={14} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>ลบร้านนี้</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        {/* Vendor Header Card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: '#E0F2FE',
              borderWidth: 1.5,
              borderColor: '#BAE6FD',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={24} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#64748B', fontSize: 11 }}>หน้ารายละเอียดร้านค้า</Text>
            <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: 'bold' }} numberOfLines={1}>
              {group.vendorName}
            </Text>
            <Text style={{ color: '#0284C7', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
              {group.totalCount} รายการในตะกร้า
            </Text>
          </View>
        </View>

        {/* Menu Items List Card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
            รายการอาหาร ({group.items.length})
          </Text>

          {group.items.map((item, idx) => (
            <CartItemRow
              key={item.menuItem.id}
              item={item}
              isFirst={idx === 0}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </View>

        {/* Order Type & Payment Method Selector for this Vendor */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <CartOrderTypeSelector
            orderType={group.orderType}
            onSelectOrderType={(type) => onSelectOrderType(group.vendorId, type)}
          />

          <CartPaymentMethodSelector
            selectedMethod={group.paymentMethod}
            onSelectMethod={(method) => onSelectPaymentMethod(group.vendorId, method)}
          />
        </View>

        {/* Special Instructions Note */}
        <CartNoteInput
          note={group.note}
          onNoteChange={(text) => onNoteChange(group.vendorId, text)}
        />

        {/* Payment Breakdown Card for this store */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 16,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#64748B', fontSize: 13 }}>ยอดรวมค่าอาหารร้านนี้</Text>
            <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }}>
              ฿{group.subtotal.toLocaleString()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#64748B', fontSize: 13 }}>ค่าบริการระบบ</Text>
            <Text style={{ color: '#16A34A', fontSize: 13, fontWeight: '600' }}>ฟรี (0 บาท)</Text>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: '#F1F5F9',
              paddingTop: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: 'bold' }}>
              ยอดชำระสุทธิร้านนี้
            </Text>
            <Text style={{ color: '#0284C7', fontSize: 20, fontWeight: 'bold' }}>
              ฿{group.subtotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Checkout Button Bar for this Vendor */}
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          padding: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => onCheckout(group)}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#0284C7',
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            opacity: isSubmitting ? 0.7 : 1,
            shadowColor: '#0284C7',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>
                สั่งซื้อเฉพาะร้านนี้ (฿{group.subtotal.toLocaleString()})
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
