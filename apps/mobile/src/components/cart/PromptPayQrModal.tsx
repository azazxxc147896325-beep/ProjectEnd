import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Order } from '@campus-food/shared-types';
import { mobileApi } from '../../lib/api';
import { mobileToast } from '../../stores/toast-store';
import { CheckCircle2, Clock, X, ShieldCheck } from 'lucide-react-native';

interface PromptPayQrModalProps {
  order: Order | null;
  visible: boolean;
  onSuccess: (updatedOrder: Order) => void;
  onClose: () => void;
}

export function PromptPayQrModal({
  order,
  visible,
  onSuccess,
  onClose,
}: PromptPayQrModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!visible || !order) {
      setSecondsLeft(300);
      setIsPaid(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, order]);

  if (!visible || !order) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const qrPayload = order.promptpayQrPayload || `00020101021229370016A000000677010111011300668123456785303764540${Number(order.totalPrice).toFixed(2)}5802TH6304`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  const handleVerifyPayment = async () => {
    try {
      setIsVerifying(true);
      const updated = await mobileApi<Order>(`/orders/${order.id}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify({ transactionId: `TXN-PP-${Date.now()}` }),
      });

      setIsPaid(true);
      mobileToast.success(
        'ชำระเงินสำเร็จ! 🎉',
        `บันทึกการชำระเงินของคิว #${order.queueNumber} เรียบร้อยแล้ว`,
      );

      setTimeout(() => {
        onSuccess(updated);
      }, 1200);
    } catch (err: any) {
      mobileToast.error(
        'ตรวจสอบไม่สำเร็จ',
        err?.message || 'ไม่สามารถยืนยันการชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.promptpayTag}>
                <Text style={styles.promptpayTagText}>Thai QR Payment</Text>
              </View>
              <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: 'bold' }}>
                พร้อมเพย์
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isPaid ? (
            /* Success State */
            <View style={{ alignItems: 'center', paddingVertical: 28, gap: 12 }}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={48} color="#16A34A" />
              </View>
              <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: 'bold' }}>
                ชำระเงินสำเร็จแล้ว!
              </Text>
              <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center' }}>
                กำลังนำคุณไปยังหน้าติดตามสถานะคิวอาหาร...
              </Text>
            </View>
          ) : (
            /* QR Code Display & Payment Content */
            <View style={{ alignItems: 'center', width: '100%', marginTop: 8 }}>
              {/* Vendor & Queue info */}
              <Text style={{ color: '#64748B', fontSize: 12 }}>
                {order.vendor?.name || 'ร้านค้า'} • คิว #{order.queueNumber}
              </Text>

              {/* Total Amount */}
              <Text style={{ color: '#0D9488', fontSize: 28, fontWeight: '900', marginTop: 4 }}>
                ฿{Number(order.totalPrice).toLocaleString()}
              </Text>

              {/* Countdown Timer */}
              <View style={styles.timerPill}>
                <Clock size={12} color="#D97706" />
                <Text style={styles.timerText}>
                  กรุณาชำระภายใน {formatTimer(secondsLeft)} นาที
                </Text>
              </View>

              {/* QR Code Card */}
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrImageUrl }}
                  style={{ width: 190, height: 190 }}
                  resizeMode="contain"
                />
              </View>

              {/* Notice */}
              <View style={styles.securityNotice}>
                <ShieldCheck size={14} color="#0D9488" />
                <Text style={{ color: '#0F766E', fontSize: 11, fontWeight: '500' }}>
                  สแกนผ่านแอป Mobile Banking ได้ทุกธนาคาร
                </Text>
              </View>

              {/* Actions */}
              <View style={{ width: '100%', gap: 10, marginTop: 18 }}>
                <TouchableOpacity
                  onPress={handleVerifyPayment}
                  disabled={isVerifying}
                  activeOpacity={0.85}
                  style={styles.verifyBtn}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} color="#FFFFFF" />
                      <Text style={styles.verifyBtnText}>
                        ฉันชำระเงินเรียบร้อยแล้ว
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.skipBtn}
                >
                  <Text style={styles.skipBtnText}>
                    ชำระภายหลัง / ไปหน้าติดตามคิว
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  promptpayTag: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  promptpayTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 6,
  },
  timerText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: 'bold',
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    marginTop: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  skipBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
