import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PaymentMethod } from '@campus-food/shared-types';
import { QrCode, Banknote, CheckCircle2 } from 'lucide-react-native';

interface CartPaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function CartPaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: CartPaymentMethodSelectorProps) {
  const isPromptPay = selectedMethod === PaymentMethod.PROMPTPAY;
  const isCash = selectedMethod === PaymentMethod.CASH;

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>
        ช่องทางการชำระเงิน
      </Text>

      <View style={{ gap: 8 }}>
        {/* Option 1: PromptPay QR */}
        <TouchableOpacity
          onPress={() => onSelectMethod(PaymentMethod.PROMPTPAY)}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 16,
            backgroundColor: isPromptPay ? '#F0F9FF' : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isPromptPay ? '#0284C7' : '#E2E8F0',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: isPromptPay ? '#E0F2FE' : '#F8FAFC',
                borderWidth: 1,
                borderColor: isPromptPay ? '#BAE6FD' : '#E2E8F0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <QrCode size={20} color={isPromptPay ? '#0284C7' : '#64748B'} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
                  พร้อมเพย์ QR Code
                </Text>
                <View
                  style={{
                    backgroundColor: '#E0F2FE',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: '#0284C7', fontSize: 10, fontWeight: 'bold' }}>
                    แนะนำ
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#64748B', fontSize: 11, marginTop: 1 }}>
                สแกนจ่ายผ่านแอปธนาคารทุกแห่ง
              </Text>
            </View>
          </View>

          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: isPromptPay ? '#0284C7' : '#CBD5E1',
              backgroundColor: isPromptPay ? '#0284C7' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isPromptPay && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} />}
          </View>
        </TouchableOpacity>

        {/* Option 2: Cash at Counter */}
        <TouchableOpacity
          onPress={() => onSelectMethod(PaymentMethod.CASH)}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 16,
            backgroundColor: isCash ? '#F0F9FF' : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isCash ? '#0284C7' : '#E2E8F0',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: isCash ? '#E0F2FE' : '#F8FAFC',
                borderWidth: 1,
                borderColor: isCash ? '#BAE6FD' : '#E2E8F0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Banknote size={20} color={isCash ? '#0284C7' : '#64748B'} />
            </View>
            <View>
              <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
                ชำระเงินสดหน้าร้าน
              </Text>
              <Text style={{ color: '#64748B', fontSize: 11, marginTop: 1 }}>
                จ่ายเงินสดตอนไปรับอาหารที่เคาน์เตอร์
              </Text>
            </View>
          </View>

          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: isCash ? '#0284C7' : '#CBD5E1',
              backgroundColor: isCash ? '#0284C7' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isCash && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
