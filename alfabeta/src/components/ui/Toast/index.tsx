import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { MotiView } from '@/components/system/MotiShim';

import { useAppStore } from '@/store/app.store';
import { theme } from '@/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom';
}

const palette = {
  success: '#16a34a',
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',
};

export const Toast = ({ message, type = 'info', duration = 2500, position = 'top' }: ToastProps) => {
  const clearToast = useAppStore((state) => state.clearToast);

  useEffect(() => {
    const timer = setTimeout(clearToast, duration);
    return () => clearTimeout(timer);
  }, [clearToast, duration]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring' }}
      style={[styles.toast, { [position]: 48, backgroundColor: palette[type] }]}
    >
      <Text style={styles.message}>{message}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 999,
  },
  message: {
    color: '#fff',
    fontSize: theme.typography.sizes.sm,
  },
});

export default Toast;

