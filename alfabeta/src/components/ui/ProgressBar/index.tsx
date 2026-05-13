import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme';

interface ProgressBarProps {
  value: number;
  color?: string;
  colorEnd?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar = ({
  value,
  color = theme.colors.primary[600],
  colorEnd,
  backgroundColor = theme.colors.neutral[100],
  height = 10,
  showLabel = true,
  label,
}: ProgressBarProps) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const gradientColors: [string, string] = colorEnd ? [color, colorEnd] : [color, color];

  return (
    <View>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label ?? ''}</Text>
          <Text style={styles.percent}>{value}%</Text>
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor, height }]}>
        <View style={[styles.fillWrapper, { width: `${clampedValue}%` as `${number}%` }]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { height }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[600],
  },
  percent: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.primary[600],
  },
  track: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fillWrapper: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.full,
  },
  fill: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
  },
});

export default ProgressBar;
