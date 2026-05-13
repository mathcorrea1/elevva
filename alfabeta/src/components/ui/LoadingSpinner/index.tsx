import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ size = 'large', color = theme.colors.primary[600], fullScreen = false }: LoadingSpinnerProps) => (
  <View style={[styles.container, fullScreen && styles.fullscreen]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 99,
  },
});

export default LoadingSpinner;
