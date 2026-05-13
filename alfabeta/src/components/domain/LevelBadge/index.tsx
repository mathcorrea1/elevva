import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LiteracyLevel } from '@/utils/literacy.levels';

import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { literacyLevels } from '@/utils/literacy.levels';

interface LevelBadgeProps {
  level: LiteracyLevel;
}

export const LevelBadge = ({ level }: LevelBadgeProps) => {
  const [open, setOpen] = useState(false);
  const info = literacyLevels[level];

  return (
    <>
      <MotiView from={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
        <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`Nivel ${info.label}`}>
          <Badge
            label={info.label}
            variant="level"
            icon={<Ionicons name={info.icon as never} size={14} color={info.color} />}
          />
        </Pressable>
      </MotiView>
      <Modal visible={open} onClose={() => setOpen(false)} title={info.label} size="sm">
        <View style={styles.content}>
          <Text style={styles.text}>{info.description}</Text>
          <Text style={styles.caption}>Toque fora para fechar.</Text>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  content: { gap: 8 },
  text: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, color: '#78716c' },
});

export default LevelBadge;

