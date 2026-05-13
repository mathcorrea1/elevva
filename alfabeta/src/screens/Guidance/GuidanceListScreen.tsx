import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { guidanceService } from '@/services/api/guidance.service';
import { theme } from '@/theme';

export const GuidanceListScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    void (async () => setItems(await guidanceService.list()))();
  }, []);

  const filtered = useMemo(
    () => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  return (
    <View style={styles.container}>
      <Header title="Orientações" subtitle={`${items.length} artigos`} />

      {/* Barra de busca */}
      <View style={styles.searchBar}>
        <View style={[styles.searchBox, focused && styles.searchBoxFocused]}>
          <Ionicons name="search" size={18} color={focused ? theme.colors.primary[600] : theme.colors.neutral[400]} />
          <TextInput
            placeholder="Buscar por tema..."
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={styles.searchInput}
            placeholderTextColor={theme.colors.neutral[400]}
          />
          {query.length > 0 ? (
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.neutral[400]}
              onPress={() => setQuery('')}
            />
          ) : null}
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma orientação encontrada"
          description={query ? `Sem resultados para "${query}"` : 'Em breve novos conteúdos serão adicionados.'}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateX: -12 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', delay: index * 50 }}
            >
              <Card onPress={() => navigation.navigate('GuidanceDetail', { guidanceId: item.id })}>
                <View style={styles.cardContent}>
                  <View style={styles.cardIconArea}>
                    <Ionicons name="bulb" size={20} color={theme.colors.secondary[500]} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.neutral[300]} />
                </View>
              </Card>
            </MotiView>
          )}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('CreateGuidance')}
        style={styles.fab}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchBar: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
  },
  searchBoxFocused: {
    borderColor: theme.colors.primary[600],
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.text,
    padding: 0,
  },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 32 : 20,
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.secondary[500],
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#f97316', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconArea: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 3 },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: theme.colors.text,
  },
  cardSummary: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[500],
    lineHeight: 18,
  },
});

export default GuidanceListScreen;

