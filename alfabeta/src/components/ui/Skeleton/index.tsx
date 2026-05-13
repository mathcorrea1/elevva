import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { MotiView } from '@/components/system/MotiShim';

import { theme } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  lines?: number;
}

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, lines = 1 }: SkeletonProps) => (
  <View style={{ gap: 8 }}>
    {Array.from({ length: lines }).map((_, index) => (
      <MotiView
        key={`sk-${index}`}
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 900, loop: true }}
        style={[styles.line, { width, height, borderRadius }]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  line: {
    backgroundColor: theme.colors.neutral[200],
  },
});

export default Skeleton;

