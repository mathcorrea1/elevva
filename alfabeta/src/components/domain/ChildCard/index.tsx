import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { Child } from '@/@types/navigation';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calculateAge } from '@/utils/formatters';
import { literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';

interface ChildCardProps {
  child: Child;
  onPress: () => void;
  showProgress?: boolean;
}

const QuickBtn = ({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 20, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 280 }); }}
      onPress={onPress}
      hitSlop={4}
    >
      <Animated.View style={[styles.quickBtn, { backgroundColor: bg }, animStyle]}>
        <Ionicons name={icon} size={13} color={color} />
        <Text style={[styles.quickBtnLabel, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

export const ChildCard = ({ child, onPress, showProgress = true }: ChildCardProps) => {
  const navigation = useNavigation<any>();

  const accent      = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
  const accentLight = theme.colors.literacyLight[child.literacyLevel as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[100];
  const gradientColors = theme.colors.gradients.level[child.literacyLevel] ?? theme.colors.gradients.primary;
  const levelInfo = literacyLevels[child.literacyLevel];

  const hasNeeds = child.specialNeeds && Object.values(child.specialNeeds).some((v) => v === true);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      {/* Main row */}
      <View style={styles.body}>
        <Avatar name={child.name} size="lg" showBorder borderColor={accent} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{child.name}</Text>
            {hasNeeds ? (
              <View style={[styles.needsBadge, { backgroundColor: accentLight }]}>
                <Ionicons name="accessibility" size={10} color={accent} />
              </View>
            ) : null}
          </View>
          <Text style={styles.meta}>
            {calculateAge(child.birthDate)} anos
            {child.turma ? ` · ${child.turma}` : child.school ? ` · ${child.school}` : ''}
          </Text>
          <View style={[styles.levelPill, { backgroundColor: accentLight }]}>
            <View style={[styles.levelDot, { backgroundColor: accent }]} />
            <Text style={[styles.levelText, { color: accent }]}>{levelInfo.label}</Text>
          </View>
        </View>
        <View style={styles.progressCircle}>
          <Text style={[styles.progressPct, { color: accent }]}>{child.progress}%</Text>
          <Text style={styles.progressLabel}>prog.</Text>
        </View>
      </View>

      {/* Progress bar */}
      {showProgress ? (
        <View style={styles.progressArea}>
          <ProgressBar
            value={child.progress}
            color={gradientColors[0]}
            colorEnd={gradientColors[1]}
            height={6}
          />
        </View>
      ) : null}

      {/* Quick action buttons */}
      <View style={styles.quickActions}>
        <QuickBtn
          icon="bar-chart"
          label="Relatório"
          color={accent}
          bg={accentLight}
          onPress={() => navigation.navigate('Children', { screen: 'StudentReport', params: { childId: child.id } })}
        />
        <QuickBtn
          icon="pencil"
          label="Atividade"
          color={theme.colors.secondary[600]}
          bg={theme.colors.secondary[50]}
          onPress={() => navigation.navigate('Activities', { screen: 'CreateActivity', params: { childId: child.id } })}
        />
        <QuickBtn
          icon="clipboard"
          label="Avaliar"
          color="#16a34a"
          bg="#dcfce7"
          onPress={() => navigation.navigate('Children', { screen: 'Assessment', params: { childId: child.id } })}
        />
        <QuickBtn
          icon="bulb"
          label="Orientar"
          color="#0284c7"
          bg="#dbeafe"
          onPress={() => navigation.navigate('Guidance', { screen: 'CreateGuidance', params: { childId: child.id } })}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0edf8',
    ...theme.shadows.level2,
  },
  accentBar: { height: 3 },
  body: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingBottom: 8,
    alignItems: 'center',
  },
  info: { flex: 1, gap: 4, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  needsBadge: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  meta: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primaryMedium,
    color: theme.colors.neutral[500],
    lineHeight: 17,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  levelDot: { width: 6, height: 6, borderRadius: 3 },
  levelText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold },
  progressCircle: { alignItems: 'center', gap: 1 },
  progressPct: { fontSize: 17, fontFamily: theme.typography.fonts.primaryExtraBold },
  progressLabel: { fontSize: 9, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },
  progressArea: { paddingHorizontal: 14, paddingBottom: 10 },
  quickActions: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#f5f3ff',
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  quickBtnLabel: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold },
});

export default ChildCard;
