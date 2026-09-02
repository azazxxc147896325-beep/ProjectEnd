import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useToastStore } from '../../stores/toast-store';
import { AlertCircle, HelpCircle, Check, X } from 'lucide-react-native';

export function CustomConfirmModal() {
  const { confirmModal, hideConfirm } = useToastStore();

  if (!confirmModal.isOpen) return null;

  const handleConfirm = () => {
    hideConfirm();
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
  };

  const handleCancel = () => {
    hideConfirm();
    if (confirmModal.onCancel) {
      confirmModal.onCancel();
    }
  };

  const isDestructive = confirmModal.isDestructive;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={confirmModal.isOpen}
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Icon */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDestructive
                  ? '#FEF2F2'
                  : '#CCFBF1',
                borderColor: isDestructive
                  ? '#FECACA'
                  : '#99F6E4',
              },
            ]}
          >
            {isDestructive ? (
              <AlertCircle size={28} color="#DC2626" />
            ) : (
              <HelpCircle size={28} color="#0D9488" />
            )}
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>{confirmModal.title}</Text>
          {confirmModal.message ? (
            <Text style={styles.message}>{confirmModal.message}</Text>
          ) : null}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>
                {confirmModal.cancelText || 'ยกเลิก'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: isDestructive ? '#DC2626' : '#0D9488',
                  shadowColor: isDestructive ? '#DC2626' : '#0D9488',
                },
              ]}
            >
              <Text style={styles.confirmText}>
                {confirmModal.confirmText || 'ตกลง'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
