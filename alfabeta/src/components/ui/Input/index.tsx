import React, { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ReactNode } from 'react';
import type { KeyboardTypeOptions } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { theme } from '@/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  mask?: (value: string) => string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  disabled?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

const InputComponent = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  secureTextEntry,
  leftIcon,
  rightIcon,
  mask,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  disabled = false,
  maxLength = 120,
  multiline = false,
  numberOfLines,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const labelProgress = useSharedValue(value ? 1 : 0);
  const shake = useSharedValue(0);

  if (error) {
    shake.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 }));
  }

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(labelProgress.value ? -18 : 0) }, { scale: withTiming(labelProgress.value ? 0.92 : 1) }],
    color: withTiming(isFocused ? theme.colors.primary[600] : theme.colors.neutral[400]),
  }));

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const borderColor = useMemo(() => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary[600];
    return theme.colors.neutral[200];
  }, [error, isFocused]);

  return (
    <AnimatedView style={[styles.wrapper, shakeStyle]}>
      {label ? <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text> : null}
      <View style={[styles.inputContainer, { borderColor, opacity: disabled ? 0.6 : 1, alignItems: multiline ? 'flex-start' : 'center' }]}>
        {leftIcon}
        <TextInput
          accessibilityLabel={label ?? placeholder}
          editable={!disabled}
          value={value}
          onFocus={() => {
            setIsFocused(true);
            labelProgress.value = withSpring(1);
          }}
          onBlur={() => {
            setIsFocused(false);
            labelProgress.value = withSpring(value ? 1 : 0);
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral[400]}
          style={styles.input}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
          onChangeText={(text) => onChangeText(mask ? mask(text) : text)}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((prev) => !prev)} accessibilityRole="button">
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={theme.colors.neutral[600]} />
          </Pressable>
        ) : (
          rightIcon
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: {
    position: 'absolute',
    left: 12,
    top: 14,
    fontSize: 14,
    fontFamily: theme.typography.fonts.primary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 4,
    zIndex: 3,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.primary,
    minHeight: 44,
  },
  error: {
    marginTop: 6,
    color: theme.colors.error,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primary,
  },
  hint: {
    marginTop: 6,
    color: theme.colors.neutral[600],
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primary,
  },
});

export const Input = memo(InputComponent);
export default Input;
