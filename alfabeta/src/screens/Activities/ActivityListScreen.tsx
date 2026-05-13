import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { ActivityCard } from '@/components/domain/ActivityCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { activityService } from '@/services/api/activity.service';
import { theme } from '@/theme';

const filters = [
  { key: 'all', label: 'Todas', icon: 'apps' as const },
  { key: 'audio', label: 'Áudio', icon: 'mic' as const },
  { key: 'writing', label: 'Escrita', icon: 'pencil' as const },
  { key: 'reading', label: 'Leitura', icon: 'book' as const },
];

const filterColor: Record<string, string> = {
  all: theme.colors.primary[600],
  audio: '#7c3aed',
  writing: '#0ea5e9',
  reading: '#22c55e',
};

export const ActivityListScreen = ({ navigation }: any) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'audio' | 'writing' | 'reading' | 'game'>('all');

  useEffect(() => {
    void (async () => { setActivities(await activityService.list()); })();
  }, []);

  const filtered = useMemo(
    () => (typeFilter === 'all' ? activities : activities.filter((a) => a.type === typeFilter)),
    [activities, typeFilter],
  );

  const completed = activities.filter((a) => a.completed).length;

  return (
    <View style={styles.container}>
      <Header
        title="Atividades"
        subtitle={`${completed} de ${activities.length} concluídas`}
      />

      {/* Filtros */}
      <View style={styles.filterBar}>
        {filters.map((f) => {
          const isActive = typeFilter === f.key;
          const color = filterColor[f.key] ?? theme.colors.primary[600];
          return (
            <Pressable
              key={f.key}
              onPress={() => setTypeFilter(f.key as any)}
              style={[styles.filterChip, isActive && { backgroundColor: color, borderColor: color }]}
            >
              <Ionicons name={f.icon} size={14} color={isActive ? '#fff' : theme.colors.neutral[500]} />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade"
          description="Não há atividades neste filtro."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: index * 60 }}
            >
              <ActivityCard
                activity={item}
                isCompleted={item.completed}
                onPress={() =>
                  item.type === 'audio'
                    ? navigation.navigate('AudioActivity', { activityId: item.id, childId: 'child-1' })
                    : navigation.navigate('ActivityDetail', { activityId: item.id })
                }
                onComplete={() => {
                  setActivities((prev) =>
                    prev.map((a) => (a.id === item.id ? { ...a, completed: true } : a)),
                  );
                }}
              />
            </MotiView>
          )}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('CreateActivity')}
        style={styles.fab}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.neutral[50],
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.neutral[500],
  },
  filterTextActive: {
    color: '#fff',
  },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 32 : 20,
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#7c3aed', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
    }),
  },
});

export default ActivityListScreen;

