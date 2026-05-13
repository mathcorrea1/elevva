import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { MotiView } from '@/components/system/MotiShim';

import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  lottieAnimation?: any;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, icon, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container}>
    <MotiView
      from={{ opacity: 0.2, scale: 0.9 }}
      animate={{ opacity: 0.4, scale: 1.05 }}
      transition={{ type: 'timing', duration: 1000, loop: true }}
      style={styles.glow}
    />
    <View style={styles.icon}>{icon ?? <Text style={styles.emoji}>📚</Text>}</View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  glow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    opacity: 0.2,
    backgroundColor: '#ede9fe',
  },
  icon: { marginTop: 12 },
  emoji: { fontSize: 46 },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.typography.fonts.primaryBold,
  },
  description: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: theme.typography.fonts.primary,
  },
});

export default EmptyState;

