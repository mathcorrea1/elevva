import React, { memo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { theme } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const variantStyles = {
  primary: { backgroundColor: 'transparent', borderColor: 'transparent', textColor: '#fff' },
  secondary: { backgroundColor: theme.colors.secondary[500], borderColor: theme.colors.secondary[500], textColor: '#fff' },
  outline: { backgroundColor: 'transparent', borderColor: theme.colors.primary[600], textColor: theme.colors.primary[700] },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent', textColor: theme.colors.primary[600] },
  danger: { backgroundColor: theme.colors.error, borderColor: theme.colors.error, textColor: '#fff' },
};

const sizeStyles = {
  sm: { paddingVertical: 9, paddingHorizontal: 16, fontSize: theme.typography.sizes.sm },
  md: { paddingVertical: 13, paddingHorizontal: 22, fontSize: theme.typography.sizes.base },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: theme.typography.sizes.lg },
};

const primaryShadow = Platform.select({
  ios: { shadowColor: '#6d28d9', shadowOpacity: 0.38, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 6 },
  default: {},
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ButtonComponent = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) => {
  const pressed = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value, { damping: 18, stiffness: 320 }) }],
  }));

  const config = variantStyles[variant];
  const { fontSize, ...padding } = sizeStyles[size];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => { pressed.value = 0.96; }}
      onPressOut={() => { pressed.value = 1; }}
      style={[
        styles.button,
        padding,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          overflow: 'hidden',
        },
        variant === 'primary' && !disabled ? primaryShadow : undefined,
        animatedStyle,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {variant === 'secondary' ? (
        <LinearGradient
          colors={theme.colors.gradients.secondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <View style={styles.content}>
        {leftIcon}
        {loading ? (
          <ActivityIndicator color={config.textColor} />
        ) : (
          <Text style={[styles.label, { color: config.textColor, fontSize }]}>{label}</Text>
        )}
        {rightIcon}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: theme.typography.fonts.primaryBold,
    letterSpacing: 0.3,
  },
});

export const Button = memo(ButtonComponent);
export default Button;
