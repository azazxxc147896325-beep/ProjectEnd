import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, MobileToast } from '../../stores/toast-store';
import { CheckCircle2, AlertCircle, Sparkles, Info, X } from 'lucide-react-native';

function ToastItemView({ item, onDismiss }: { item: MobileToast; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const isSuccess = item.type === 'success';
  const isError = item.type === 'error';
  const isWarning = item.type === 'warning';
  const isInfo = item.type === 'info';

  const borderColor = isSuccess
    ? '#A7F3D0'
    : isError
    ? '#FECACA'
    : isWarning
    ? '#FDE68A'
    : '#99F6E4';

  const iconBg = isSuccess
    ? '#ECFDF5'
    : isError
    ? '#FEF2F2'
    : isWarning
    ? '#FFFBEB'
    : '#CCFBF1';

  const accentColor = isSuccess
    ? '#059669'
    : isError
    ? '#DC2626'
    : isWarning
    ? '#D97706'
    : '#0D9488';

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          borderColor,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePressDismiss}
        style={styles.toastContent}
      >
        {/* Icon Badge */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg, borderColor }]}>
          {isSuccess && <CheckCircle2 size={18} color="#059669" />}
          {isError && <AlertCircle size={18} color="#DC2626" />}
          {isWarning && <Sparkles size={18} color="#D97706" />}
          {isInfo && <Info size={18} color="#0D9488" />}
        </View>

        {/* Text Details */}
        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          {item.message ? (
            <Text numberOfLines={2} style={styles.messageText}>
              {item.message}
            </Text>
          ) : null}
        </View>

        {/* Dismiss X */}
        <TouchableOpacity
          onPress={handlePressDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
        >
          <X size={14} color="#64748B" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer() {
  const insets = useSafeAreaInsets();
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          top: insets.top + (Platform.OS === 'ios' ? 8 : 16),
        },
      ]}
    >
      {toasts.map((toast) => (
        <ToastItemView
          key={toast.id}
          item={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  messageText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
