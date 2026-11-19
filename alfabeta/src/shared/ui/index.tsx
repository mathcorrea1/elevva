import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';

export function Copy({
  children,
  heading = false,
  muted = false,
  headingLevel = 2,
  size,
}: PropsWithChildren<{
  heading?: boolean;
  muted?: boolean;
  headingLevel?: 1 | 2 | 3;
  size?: 'caption' | 'body' | 'title' | 'display';
}>) {
  const { colors, preferences } = useTheme();
  return (
    <Text
      accessibilityRole={heading ? 'header' : 'text'}
      aria-level={heading ? headingLevel : undefined}
      style={{
        color: muted ? colors.secondary : colors.text,
        fontFamily: heading || size === 'display' ? tokens.fontHeading : tokens.fontFamily,
        fontSize:
          (size === 'caption'
            ? 12
            : size === 'display'
              ? 32
              : heading || size === 'title'
                ? 22
                : 15) * preferences.font_scale,
        lineHeight:
          (size === 'caption'
            ? 19
            : size === 'display'
              ? 41
              : heading || size === 'title'
                ? 30
                : 24) * preferences.font_scale,
        fontWeight: heading ? '700' : '400',
        letterSpacing: heading ? -0.65 : 0,
        flexShrink: 1,
      }}
    >
      {children}
    </Text>
  );
}
export function Action({
  title,
  accessibilityLabel: label,
  onPress,
  secondary = false,
  disabled = false,
  selected,
  expanded,
  quiet = false,
  destructive = false,
  icon: Icon,
}: {
  title: string;
  accessibilityLabel?: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  selected?: boolean;
  expanded?: boolean;
  quiet?: boolean;
  destructive?: boolean;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}) {
  const { colors, preferences, reducedMotion } = useTheme();
  const [focused, focus] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || title}
      accessibilityState={{ disabled, selected, expanded }}
      aria-pressed={selected}
      aria-expanded={expanded}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => focus(true)}
      onBlur={() => focus(false)}
      style={({ pressed }) => ({
        minHeight: Math.max(tokens.touchTarget, 52),
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: focused
          ? colors.focus
          : quiet
            ? 'transparent'
            : secondary
              ? selected
                ? colors.primary
                : colors.divider
              : destructive
                ? colors.error
                : colors.primary,
        backgroundColor: quiet
          ? 'transparent'
          : secondary
            ? selected
              ? colors.primarySoft
              : colors.surface
            : destructive
              ? colors.error
              : colors.primary,
        opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        transform: reducedMotion ? [] : [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {Icon && (
        <Icon
          size={20}
          color={
            secondary || quiet ? (destructive ? colors.error : colors.primary) : colors.onPrimary
          }
        />
      )}
      <Text
        style={{
          fontSize: 14 * preferences.font_scale,
          lineHeight: 21 * preferences.font_scale,
          fontFamily: tokens.fontSemibold,
          fontWeight: '600',
          textAlign: 'center',
          flexShrink: 1,
          color: quiet
            ? destructive
              ? colors.error
              : colors.primary
            : secondary
              ? destructive
                ? colors.error
                : colors.text
              : colors.onPrimary,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors, preferences } = useTheme();
  const [focused, focus] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontFamily: tokens.fontMedium,
          color: colors.text,
          fontSize: 13 * preferences.font_scale,
          lineHeight: 21 * preferences.font_scale,
        }}
      >
        {label}
      </Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        onFocus={(e) => {
          focus(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          focus(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor={colors.secondary}
        style={[
          {
            color: colors.text,
            fontFamily: tokens.fontFamily,
            backgroundColor: colors.mutedSurface,
            fontSize: 15 * preferences.font_scale,
            padding: 16,
            minHeight: 54,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: focused ? colors.focus : colors.border,
            textAlignVertical: 'top',
          },
          props.style,
        ]}
      />
    </View>
  );
}
export function Card({ children }: PropsWithChildren) {
  const { colors, preferences } = useTheme();
  return (
    <View
      style={{
        gap: 14,
        padding: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 22,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: preferences.contrast ? 0 : 0.035,
        shadowRadius: 14,
        elevation: preferences.contrast ? 0 : 1,
      }}
    >
      {children}
    </View>
  );
}
export function Stack({ children }: PropsWithChildren) {
  return <View style={{ gap: 12 }}>{children}</View>;
}
export function Page({
  children,
  title,
  scrollRef,
}: PropsWithChildren<{ title?: string; scrollRef?: React.RefObject<ScrollView | null> }>) {
  const { colors } = useTheme();
  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        gap: 24,
        width: '100%',
        maxWidth: 1040,
        alignSelf: 'center',
      }}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {!!title && (
        <Copy heading headingLevel={1}>
          {title}
        </Copy>
      )}
      {children}
    </ScrollView>
  );
}
export function Notice({ text, error = false }: { text: string; error?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      role={error ? 'alert' : undefined}
      style={{
        padding: 14,
        borderWidth: 2,
        borderColor: error ? colors.error : colors.divider,
        borderRadius: 16,
        backgroundColor: colors.mutedSurface,
      }}
    >
      <Copy>{text}</Copy>
    </View>
  );
}
export function Loading() {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel="Carregando" style={{ padding: 20 }}>
      <ActivityIndicator color={colors.primary} />
      <Copy>Carregando…</Copy>
    </View>
  );
}
