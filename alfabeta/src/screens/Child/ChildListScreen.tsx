import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { ChildCard } from '@/components/domain/ChildCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useChild } from '@/hooks/useChild';
import { LiteracyLevel, literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';
import type { Child } from '@/@types/navigation';

/* ─── Level filters ─── */

const LEVEL_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: LiteracyLevel.PRE_SILABICO,        label: 'Pré-silábico' },
  { key: LiteracyLevel.SILABICO_SEM_VALOR,  label: 'Sil. s/ valor' },
  { key: LiteracyLevel.SILABICO_COM_VALOR,  label: 'Sil. c/ valor' },
  { key: LiteracyLevel.SILABICO_ALFABETICO, label: 'Sil.-alfa.' },
  { key: LiteracyLevel.ALFABETICO,          label: 'Alfabético' },
] as const;

/* ─── View modes ─── */

type ViewMode = 'list' | 'school' | 'turma' | 'needs';

const VIEW_MODES: Array<{ key: ViewMode; icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { key: 'list',   icon: 'list',       label: 'Lista' },
  { key: 'school', icon: 'business',   label: 'Escola' },
  { key: 'turma',  icon: 'people',     label: 'Turma' },
  { key: 'needs',  icon: 'accessibility', label: 'NEE' },
];

/* ─── Sort options ─── */

type SortKey = 'name' | 'level' | 'progress';

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'name',     label: 'Nome' },
  { key: 'progress', label: 'Progresso' },
  { key: 'level',    label: 'Nível' },
];

const LEVEL_ORDER: Record<string, number> = {
  [LiteracyLevel.PRE_SILABICO]: 0,
  [LiteracyLevel.SILABICO_SEM_VALOR]: 1,
  [LiteracyLevel.SILABICO_COM_VALOR]: 2,
  [LiteracyLevel.SILABICO_ALFABETICO]: 3,
  [LiteracyLevel.ALFABETICO]: 4,
};

/* ─── Special needs label for grouping ─── */

const NEEDS_GROUP_LABELS: Record<string, string> = {
  autism:             'TEA — Transtorno do Espectro Autista',
  dyslexia:          'Dislexia',
  adhd:              'TDAH',
  dyscalculia:       'Discalculia',
  visualImpairment:  'Deficiência visual',
  hearingImpairment: 'Deficiência auditiva',
  none:              'Sem necessidades especiais identificadas',
};

/* ─── Helpers ─── */

const sortChildren = (list: Child[], sort: SortKey): Child[] =>
  [...list].sort((a, b) => {
    if (sort === 'name')     return a.name.localeCompare(b.name, 'pt-BR');
    if (sort === 'progress') return b.progress - a.progress;
    if (sort === 'level')    return (LEVEL_ORDER[a.literacyLevel] ?? 0) - (LEVEL_ORDER[b.literacyLevel] ?? 0);
    return 0;
  });

const groupBy = <T,>(list: T[], key: (item: T) => string): Array<{ title: string; data: T[] }> => {
  const map = new Map<string, T[]>();
  list.forEach((item) => {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  });
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
};

const getNeedsKey = (child: Child): string => {
  const needs = child.specialNeeds ?? {};
  const active = Object.entries(needs)
    .filter(([k, v]) => v === true && k in NEEDS_GROUP_LABELS)
    .map(([k]) => k);
  if (active.length === 0) return 'none';
  return active[0]; // group by primary need
};

/* ─── Section header ─── */

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderTitle}>{title}</Text>
    <View style={styles.sectionHeaderBadge}>
      <Text style={styles.sectionHeaderCount}>{count}</Text>
    </View>
  </View>
);

/* ─── Main screen ─── */

export const ChildListScreen = ({ navigation }: any) => {
  const { children, fetchChildren, loading } = useChild();
  const [levelFilter, setLevelFilter] = useState<'all' | LiteracyLevel>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [showSort, setShowSort] = useState(false);
  const searchRef = useRef<TextInput>(null);

  useEffect(() => { void fetchChildren(); }, [fetchChildren]);

  /* Apply level filter + search, then sort */
  const filtered = useMemo(() => {
    let list = levelFilter === 'all'
      ? children
      : children.filter((c) => c.literacyLevel === levelFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.school ?? '').toLowerCase().includes(q) ||
        (c.turma ?? '').toLowerCase().includes(q),
      );
    }
    return sortChildren(list, sortKey);
  }, [children, levelFilter, search, sortKey]);

  /* Group data for sectioned views */
  const sections = useMemo(() => {
    if (viewMode === 'school') {
      return groupBy(filtered, (c) => c.school ?? 'Escola não informada');
    }
    if (viewMode === 'turma') {
      return groupBy(filtered, (c) =>
        c.turma ? (c.school ? `${c.school} — ${c.turma}` : c.turma) : 'Turma não informada',
      );
    }
    if (viewMode === 'needs') {
      return groupBy(filtered, (c) => NEEDS_GROUP_LABELS[getNeedsKey(c)] ?? 'Sem necessidades especiais');
    }
    return [];
  }, [filtered, viewMode]);

  const isGrouped = viewMode !== 'list';

  const navigateToChild = (childId: string) => navigation.navigate('ChildDetail', { childId });

  const renderChildCard = (item: Child, index: number) => (
    <MotiView
      key={item.id}
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 16, stiffness: 220, delay: index * 55 }}
    >
      <ChildCard child={item} onPress={() => navigateToChild(item.id)} />
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Estudantes"
        subtitle={`${children.length} ${children.length === 1 ? 'estudante' : 'estudantes'}`}
      />

      {/* Search bar */}
      <MotiView
        from={{ opacity: 0, translateY: -6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 280, delay: 60 }}
        style={styles.searchWrapper}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={theme.colors.neutral[400]} />
          <TextInput
            ref={searchRef}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome, escola ou turma…"
            placeholderTextColor={theme.colors.neutral[400]}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && Platform.OS !== 'ios' ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={theme.colors.neutral[400]} />
            </Pressable>
          ) : null}
        </View>
      </MotiView>

      {/* View mode toggle + sort */}
      <View style={styles.toolbarRow}>
        <View style={styles.viewModeGroup}>
          {VIEW_MODES.map((mode) => (
            <Pressable
              key={mode.key}
              style={[styles.viewModeBtn, viewMode === mode.key && styles.viewModeBtnActive]}
              onPress={() => setViewMode(mode.key)}
              hitSlop={4}
            >
              <Ionicons
                name={mode.icon}
                size={15}
                color={viewMode === mode.key ? theme.colors.primary[600] : theme.colors.neutral[400]}
              />
              <Text style={[styles.viewModeBtnText, viewMode === mode.key && styles.viewModeBtnTextActive]}>
                {mode.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.sortBtn} onPress={() => setShowSort((v) => !v)} hitSlop={8}>
          <Ionicons name="swap-vertical" size={15} color={theme.colors.primary[600]} />
          <Text style={styles.sortBtnText}>{SORT_OPTIONS.find((s) => s.key === sortKey)?.label}</Text>
        </Pressable>
      </View>

      {/* Sort dropdown */}
      {showSort ? (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={styles.sortOption}
              onPress={() => { setSortKey(opt.key); setShowSort(false); }}
            >
              <Ionicons
                name={sortKey === opt.key ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={sortKey === opt.key ? theme.colors.primary[600] : theme.colors.neutral[400]}
              />
              <Text style={[styles.sortOptionText, sortKey === opt.key && { color: theme.colors.primary[600], fontFamily: theme.typography.fonts.primarySemiBold }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Level filter chips */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={LEVEL_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = levelFilter === item.key;
            const accentColor = item.key === 'all'
              ? theme.colors.primary[600]
              : (theme.colors.literacy[item.key as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600]);
            return (
              <Pressable
                onPress={() => setLevelFilter(item.key as 'all' | LiteracyLevel)}
                style={[styles.chip, isActive && { borderColor: accentColor, backgroundColor: '#fff' }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={`Filtrar: ${item.label}`}
              >
                {isActive ? <View style={[styles.chipDot, { backgroundColor: accentColor }]} /> : null}
                <Text style={[styles.chipText, isActive && { color: accentColor, fontFamily: theme.typography.fonts.primaryBold }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.skeletonArea}>
          <Skeleton height={88} lines={3} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum resultado' : 'Nenhum estudante encontrado'}
          description={
            search
              ? `Nenhum estudante corresponde a "${search}".`
              : levelFilter === 'all'
                ? 'Adicione seu primeiro estudante para comecar!'
                : `Nenhum estudante no nivel "${literacyLevels[levelFilter as LiteracyLevel]?.label ?? levelFilter}".`
          }
          actionLabel={!search && levelFilter === 'all' ? 'Adicionar estudante' : undefined}
          onAction={!search && levelFilter === 'all' ? () => navigation.navigate('AddChild') : undefined}
        />
      ) : isGrouped ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} count={section.data.length} />
          )}
          renderItem={({ item, index }) => renderChildCard(item, index)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item, index }) => renderChildCard(item, index)}
        />
      )}

      {/* FAB */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260, delay: 350 }}
        style={styles.fabWrapper}
      >
        <Pressable
          onPress={() => navigation.navigate('AddChild')}
          style={styles.fab}
          accessibilityRole="button"
          accessibilityLabel="Adicionar estudante"
        >
          <LinearGradient
            colors={theme.colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </Pressable>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  /* Search */
  searchWrapper: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text,
    paddingVertical: 0,
  },

  /* Toolbar */
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
    gap: 10,
  },
  viewModeGroup: { flexDirection: 'row', flex: 1, gap: 4 },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  viewModeBtnActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  viewModeBtnText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[400],
  },
  viewModeBtnTextActive: { color: theme.colors.primary[600] },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  sortBtnText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.primary[600] },

  /* Sort dropdown */
  sortDropdown: {
    position: 'absolute',
    right: 16,
    top: 130,
    zIndex: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: '#f0edf8',
    ...theme.shadows.level3,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text,
  },

  /* Level filter */
  filterWrapper: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
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
  chipDot: { width: 7, height: 7, borderRadius: 3.5 },
  chipText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  sectionHeaderTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderBadge: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionHeaderCount: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.primary[600],
  },

  /* List */
  skeletonArea: { padding: 16, gap: 10 },
  listContent: { padding: 16, paddingBottom: 110 },

  /* FAB */
  fabWrapper: { position: 'absolute', right: 20, bottom: 28 },
  fab: { borderRadius: 28, overflow: 'hidden', ...theme.shadows.level4 },
  fabGradient: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default ChildListScreen;

