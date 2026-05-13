import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Recommendation } from '@/@types/navigation';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: () => void;
  onDismiss: () => void;
}

const urgencyConfig = {
  low: {
    gradient: ['#dbeafe', '#eff6ff'] as [string, string],
    accent: '#2563eb',
    accentLight: '#dbeafe',
    icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
    label: 'Informativo',
  },
  medium: {
    gradient: ['#fef3c7', '#fffbeb'] as [string, string],
    accent: '#d97706',
    accentLight: '#fef3c7',
    icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
    label: 'Recomendado',
  },
  high: {
    gradient: ['#fee2e2', '#fff1f2'] as [string, string],
    accent: '#dc2626',
    accentLight: '#fee2e2',
    icon: 'warning' as keyof typeof Ionicons.glyphMap,
    label: 'Urgente',
  },
};

export const RecommendationCard = ({ recommendation, onAccept, onDismiss }: RecommendationCardProps) => {
  const config = urgencyConfig[recommendation.urgency];

  return (
    <View style={[styles.card, theme.shadows.level2]}>
      <View style={[styles.accentLine, { backgroundColor: config.accent }]} />
      <LinearGradient colors={config.gradient} style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: config.accentLight }]}>
            <Ionicons name={config.icon} size={18} color={config.accent} />
          </View>
          <View style={styles.titleArea}>
            <Text style={[styles.urgencyLabel, { color: config.accent }]}>{config.label}</Text>
            <Text style={styles.title}>{recommendation.title}</Text>
          </View>
        </View>
        <Text style={styles.description}>{recommendation.description}</Text>
        <View style={styles.actions}>
          <Button label="Aceitar" onPress={onAccept} size="sm" />
          <Button label="Dispensar" onPress={onDismiss} size="sm" variant="ghost" />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
  accentLine: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  urgencyLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primaryBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primaryMedium,
    color: theme.colors.neutral[600],
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 2,
  },
});

export default RecommendationCard;
