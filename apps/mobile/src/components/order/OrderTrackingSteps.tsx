import React from 'react';
import { View, Text } from 'react-native';
import { OrderStatus } from '@campus-food/shared-types';
import { Clock, Flame, BellRing, CheckCircle2 } from 'lucide-react-native';

interface OrderTrackingStepsProps {
  status: OrderStatus;
}

export function OrderTrackingSteps({ status }: OrderTrackingStepsProps) {
  const steps = [
    {
      status: OrderStatus.PENDING,
      title: 'รอร้านรับออเดอร์',
      desc: 'คำสั่งซื้อถูกส่งไปยังร้านค้าแล้ว',
      icon: Clock,
    },
    {
      status: OrderStatus.COOKING,
      title: 'กำลังปรุงอาหาร',
      desc: 'พ่อครัว/แม่ค้ากำลังปรุงอาหารตามคิวของคุณ',
      icon: Flame,
    },
    {
      status: OrderStatus.READY,
      title: 'อาหารพร้อมรับแล้ว! 🎉',
      desc: 'อาหารทำเสร็จแล้ว กรุณาไปรับที่เคาน์เตอร์หน้าร้าน',
      icon: BellRing,
    },
    {
      status: OrderStatus.COMPLETED,
      title: 'รับประทานให้อร่อย',
      desc: 'ออเดอร์เสร็จสมบูรณ์เรียบร้อย',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
      case OrderStatus.ACCEPTED:
        return 0;
      case OrderStatus.COOKING:
        return 1;
      case OrderStatus.READY:
        return 2;
      case OrderStatus.COMPLETED:
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(status);

  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 20,
      }}
    >
      <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 16 }}>
        สถานะการเตรียมอาหาร (Real-time)
      </Text>

      <View style={{ gap: 20 }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPast = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isFuture = idx > currentStepIdx;

          return (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: isCurrent
                      ? '#f97316'
                      : isPast
                      ? '#10b981'
                      : '#1e293b',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon size={18} color={isCurrent || isPast ? '#ffffff' : '#64748b'} />
                </View>
                {idx < steps.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      height: 24,
                      backgroundColor: isPast ? '#10b981' : '#1e293b',
                      marginTop: 4,
                    }}
                  />
                )}
              </View>

              <View style={{ flex: 1, paddingTop: 4 }}>
                <Text
                  style={{
                    color: isCurrent ? '#f97316' : isPast ? '#f8fafc' : '#64748b',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                >
                  {step.title}
                </Text>
                <Text style={{ color: isFuture ? '#475569' : '#94a3b8', fontSize: 12, marginTop: 2 }}>
                  {step.desc}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
