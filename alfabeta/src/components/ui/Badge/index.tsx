import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { theme } from '@/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'level';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const variantConfig = {
  success: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  warning: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
  error: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  info: { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' },
  level: { bg: '#ede9fe', text: theme.colors.primary[700], border: '#ddd6fe' },
};

export const Badge = ({ label, variant = 'info', size = 'md', icon }: BadgeProps) => {
  const config = variantConfig[variant];
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: size === 'sm' ? 3 : 5,
        },
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: config.text, fontSize: size === 'sm' ? 11 : 13 }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: theme.typography.fonts.primarySemiBold,
  },
});

export default Badge;
