import React from 'react';
import { View, Text } from 'react-native';
import { OrderStatus } from '@campus-food/shared-types';
import { Clock, BellRing, CheckCircle2 } from 'lucide-react-native';

interface OrderTrackingStepsProps {
  status: OrderStatus;
}

export function OrderTrackingSteps({ status }: OrderTrackingStepsProps) {
  const steps = [
    {
      status: OrderStatus.PENDING,
      title: 'รอร้านรับออเดอร์',
      desc: 'คำสั่งซื้อถูกส่งไปยังร้านค้าแล้ว รอร้านค้ายืนยันรับออเดอร์',
      icon: Clock,
    },
    {
      status: OrderStatus.ACCEPTED,
      title: 'ร้านรับออเดอร์แล้ว',
      desc: 'ร้านค้ารับออเดอร์แล้ว และกำลังจัดเตรียมอาหารตามคิว',
      icon: CheckCircle2,
    },
    {
      status: OrderStatus.READY,
      title: 'อาหารพร้อมรับแล้ว 🎉',
      desc: 'อาหารปรุงเสร็จแล้ว กรุณาไปรับที่เคาน์เตอร์หน้าร้าน',
      icon: BellRing,
    },
    {
      status: OrderStatus.COMPLETED,
      title: 'รับประทานให้อร่อย 🍽️',
      desc: 'ออเดอร์เสร็จสมบูรณ์เรียบร้อย',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return 0;
      case OrderStatus.ACCEPTED:
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
        backgroundColor: '#111E18',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1E352B',
        marginBottom: 20,
      }}
    >
      <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 'bold', marginBottom: 16 }}>
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
                      ? '#10B981'
                      : isPast
                      ? '#059669'
                      : '#162720',
                    borderWidth: 1,
                    borderColor: isCurrent ? '#10B981' : isPast ? '#059669' : '#244034',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon size={18} color={isCurrent || isPast ? '#FFFFFF' : '#6E8B7E'} />
                </View>
                {idx < steps.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      height: 24,
                      backgroundColor: isPast ? '#10B981' : '#1E352B',
                      marginTop: 4,
                    }}
                  />
                )}
              </View>

              <View style={{ flex: 1, paddingTop: 4 }}>
                <Text
                  style={{
                    color: isCurrent ? '#8FBC7A' : isPast ? '#F8FAFC' : '#6E8B7E',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                >
                  {step.title}
                </Text>
                <Text style={{ color: isFuture ? '#526A5E' : '#88A096', fontSize: 12, marginTop: 2 }}>
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
