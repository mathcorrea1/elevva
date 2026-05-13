import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { theme } from '@/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  transparent?: boolean;
  subtitle?: string;
}

export const Header = ({ title, showBack = false, onBack, rightAction, transparent = false, subtitle }: HeaderProps) => (
  <MotiView
    from={{ opacity: 0, translateY: -8 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 240 }}
    style={[styles.container, transparent && styles.transparent]}
  >
    <View style={styles.side}>
      {showBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.backButton}
        >
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primary[700]} />
          </View>
        </Pressable>
      ) : null}
    </View>
    <View style={styles.titleArea}>
      <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    <View style={[styles.side, styles.right]}>{rightAction}</View>
  </MotiView>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  side: {
    width: 52,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.primaryBold,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fonts.primaryMedium,
    marginTop: 1,
  },
});

export default Header;
