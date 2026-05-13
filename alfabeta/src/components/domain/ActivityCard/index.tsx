import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChildActivity } from '@/@types/navigation';

import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

interface ActivityCardProps {
  activity: ChildActivity;
  onPress: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

const typeConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; bg: string }> = {
  audio: { icon: 'mic', label: 'Áudio', color: '#7c3aed', bg: '#ede9fe' },
  writing: { icon: 'pencil', label: 'Escrita', color: '#0ea5e9', bg: '#dbeafe' },
  reading: { icon: 'book', label: 'Leitura', color: '#22c55e', bg: '#dcfce7' },
  game: { icon: 'game-controller', label: 'Jogo', color: '#f97316', bg: '#ffedd5' },
};

export const ActivityCard = ({ activity, onPress, onComplete, isCompleted }: ActivityCardProps) => {
  const type = typeConfig[activity.type] ?? typeConfig.reading;

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: type.bg }]}>
          <Ionicons name={type.icon} size={20} color={type.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{activity.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.typePill, { backgroundColor: type.bg }]}>
              <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
            </View>
          </View>
        </View>
        <MotiView
          from={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark" size={16} color="#16a34a" />
            </View>
          ) : (
            <View style={styles.pendingCircle} />
          )}
        </MotiView>
      </View>
      {!isCompleted ? (
        <View style={styles.actionRow}>
          <Button label="Iniciar atividade" onPress={onComplete} size="sm" />
        </View>
      ) : (
        <View style={styles.completedRow}>
          <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
          <Text style={styles.completedText}>Concluída</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  typeText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
  },
  actionRow: {
    paddingTop: 4,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  completedText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: '#16a34a',
  },
});

export default ActivityCard;
