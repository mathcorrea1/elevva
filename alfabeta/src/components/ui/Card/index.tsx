import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { theme } from '@/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  elevation?: 1 | 2 | 3 | 4 | 5;
  borderRadius?: number;
  padding?: number;
  animated?: boolean;
  style?: object;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card = ({
  children,
  onPress,
  elevation = 2,
  borderRadius = theme.borderRadius.lg,
  padding = 16,
  animated = true,
  style,
}: CardProps) => {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { if (animated) scale.value = withSpring(0.975, { damping: 20, stiffness: 280 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 280 }); }}
        style={[styles.card, theme.shadows[`level${elevation}`], { borderRadius, padding }, anim, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.card, theme.shadows[`level${elevation}`], { borderRadius, padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
});

export default Card;
