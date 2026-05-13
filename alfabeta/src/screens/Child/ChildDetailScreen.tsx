import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

import { MotiView } from '@/components/system/MotiShim';
import { Avatar } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/domain/LevelBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useChild } from '@/hooks/useChild';
import { calculateAge, formatDate } from '@/utils/formatters';
import { literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';
import type { BimestreReport, Child, IndividualGuidance, ProgressEntry } from '@/@types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab definitions                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

const TABS = [
  { key: 'overview',    label: 'Geral',       icon: 'person' as const },
  { key: 'progress',   label: 'Progresso',   icon: 'trending-up' as const },
  { key: 'activities', label: 'Atividades',  icon: 'book' as const },
  { key: 'guidance',   label: 'Orientações', icon: 'bulb' as const },
  { key: 'data',       label: 'Dados',       icon: 'settings' as const },
] as const;

type TabKey = typeof TABS[number]['key'];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Special needs labels                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

const SPECIAL_NEEDS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  autism:            { label: 'TEA',         color: '#7c3aed', bg: '#f3e8ff' },
  dyslexia:         { label: 'Dislexia',    color: '#0284c7', bg: '#dbeafe' },
  adhd:             { label: 'TDAH',         color: '#ea580c', bg: '#ffedd5' },
  dyscalculia:      { label: 'Discalculia', color: '#d97706', bg: '#fef3c7' },
  visualImpairment: { label: 'Visual',      color: '#16a34a', bg: '#dcfce7' },
  hearingImpairment:{ label: 'Auditivo',    color: '#0e7490', bg: '#cffafe' },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* SpecialNeedsBadges                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

const SpecialNeedsBadges = ({ needs }: { needs: Child['specialNeeds'] }) => {
  if (!needs) return null;
  const active = Object.entries(needs).filter(([, v]) => v === true);
  if (active.length === 0) return null;

  return (
    <View style={styles.badgeRow}>
      {active.map(([key]) => {
        const meta = SPECIAL_NEEDS_LABELS[key];
        if (!meta) return null;
        return (
          <View key={key} style={[styles.needsBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.needsBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab bar                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

const TAB_COUNT = TABS.length;
const INDICATOR_WIDTH = SCREEN_WIDTH / TAB_COUNT;

interface TabBarProps {
  active: TabKey;
  accent: string;
  onChange: (key: TabKey) => void;
}

const TabBar = ({ active, accent, onChange }: TabBarProps) => {
  const activeIdx = TABS.findIndex((t) => t.key === active);
  const indicatorX = useSharedValue(activeIdx * INDICATOR_WIDTH);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handlePress = useCallback(
    (key: TabKey, idx: number) => {
      indicatorX.value = withSpring(idx * INDICATOR_WIDTH, { damping: 18, stiffness: 280 });
      onChange(key);
    },
    [indicatorX, onChange],
  );

  return (
    <View style={styles.tabBar}>
      <Animated.View
        style={[
          styles.tabIndicator,
          { width: INDICATOR_WIDTH, backgroundColor: accent },
          indicatorStyle,
        ]}
      />
      {TABS.map((tab, idx) => {
        const focused = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handlePress(tab.key, idx)}
            hitSlop={4}
          >
            <Ionicons
              name={focused ? tab.icon : (`${tab.icon}-outline` as any)}
              size={16}
              color={focused ? accent : theme.colors.neutral[400]}
            />
            <Text style={[styles.tabLabel, focused && { color: accent }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab: Visão Geral                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

const OverviewTab = ({ child, accent, accentLight, gradient, navigation }: {
  child: Child;
  accent: string;
  accentLight: string;
  gradient: [string, string];
  navigation: any;
}) => {
  const levelInfo = literacyLevels[child.literacyLevel];
  const completedCount = child.activities.filter((a) => a.completed).length;
  const lastBimestre = child.bimestreReports?.at(-1);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Quick stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Progresso', value: `${child.progress}%`, color: accent },
          { label: 'Atividades', value: `${completedCount}/${child.activities.length}`, color: theme.colors.secondary[500] },
          { label: 'Bimestre', value: lastBimestre ? `${lastBimestre.bimestre}°` : '—', color: '#22c55e' },
        ].map((s) => (
          <LinearGradient key={s.label} colors={['#ffffff', '#fafaf8']} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Evolução no ciclo atual</Text>
        <ProgressBar
          value={child.progress}
          color={gradient[0]}
          colorEnd={gradient[1]}
          height={10}
          label={`${child.progress}% — ${levelInfo.label}`}
        />
      </View>

      {/* Observations */}
      {child.observations ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={16} color={accent} />
            <Text style={styles.cardTitle}>Observações</Text>
          </View>
          <Text style={styles.observationText}>{child.observations}</Text>
        </View>
      ) : null}

      {/* Tags */}
      {child.tags && child.tags.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Etiquetas</Text>
          <View style={styles.tagsWrap}>
            {child.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: accentLight }]}>
                <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Recommendations */}
      {child.recommendations.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star" size={16} color={accent} />
            <Text style={styles.cardTitle}>Recomendações</Text>
          </View>
          {child.recommendations.map((rec) => {
            const urgencyColor = rec.urgency === 'high' ? '#ef4444' : rec.urgency === 'medium' ? '#f59e0b' : '#22c55e';
            return (
              <View key={rec.id} style={styles.recRow}>
                <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDesc}>{rec.description}</Text>
                  {rec.category ? (
                    <Text style={[styles.recCategory, { color: urgencyColor }]}>{rec.category}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('ChildProgress', { childId: child.id })}
        >
          <Ionicons name="bar-chart" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Ver relatório</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtnOutline, { borderColor: accent }]}
          onPress={() => navigation.navigate('TrailList', { childId: child.id })}
        >
          <Ionicons name="git-network" size={18} color={accent} />
          <Text style={[styles.actionBtnOutlineText, { color: accent }]}>Ver trilhas</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab: Progresso                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

const ProgressTab = ({ child, accent }: { child: Child; accent: string }) => {
  const history = child.progressHistory ?? [];
  const bimestreReports = child.bimestreReports ?? [];
  const [selectedBimestre, setSelectedBimestre] = useState<number | null>(null);

  const filteredHistory = selectedBimestre == null
    ? history
    : history.filter((entry) => {
        const report = bimestreReports.find((r) => r.bimestre === selectedBimestre);
        if (!report) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(`${report.year}-${String((selectedBimestre - 1) * 3 + 1).padStart(2, '0')}-01`);
      });

  const chartData = filteredHistory.length > 0 ? filteredHistory : history;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Bimestre selector */}
      {bimestreReports.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Filtrar por bimestre</Text>
          <View style={styles.bimestreRow}>
            <Pressable
              style={[styles.bimestreBtn, selectedBimestre == null && { backgroundColor: accent }]}
              onPress={() => setSelectedBimestre(null)}
            >
              <Text style={[styles.bimestreBtnText, selectedBimestre == null && { color: '#fff' }]}>Todos</Text>
            </Pressable>
            {bimestreReports.map((r) => (
              <Pressable
                key={r.bimestre}
                style={[styles.bimestreBtn, selectedBimestre === r.bimestre && { backgroundColor: accent }]}
                onPress={() => setSelectedBimestre(r.bimestre)}
              >
                <Text style={[styles.bimestreBtnText, selectedBimestre === r.bimestre && { color: '#fff' }]}>
                  {r.bimestre}°
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* Line chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Linha do tempo</Text>
        {chartData.length >= 2 ? (
          <LineChart
            data={{
              labels: chartData.map((e) => e.date.slice(5)),
              datasets: [{ data: chartData.map((e) => e.score), strokeWidth: 3 }],
            }}
            width={CHART_WIDTH}
            height={180}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fafaf8',
              decimalPlaces: 0,
              color: (opacity = 1) => `${accent}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
              labelColor: () => theme.colors.neutral[500],
              propsForDots: { r: '5', strokeWidth: '2', stroke: accent },
            }}
            bezier
            style={{ borderRadius: theme.borderRadius.lg, marginLeft: -8 }}
          />
        ) : (
          <View style={styles.noData}>
            <Ionicons name="analytics-outline" size={32} color={theme.colors.neutral[300]} />
            <Text style={styles.noDataText}>Histórico insuficiente para o gráfico.</Text>
          </View>
        )}
      </View>

      {/* Progress history list */}
      {history.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de avaliações</Text>
          {[...history].reverse().map((entry: ProgressEntry, idx) => {
            const levelMeta = literacyLevels[entry.level];
            const levelColor = theme.colors.literacy[entry.level as keyof typeof theme.colors.literacy] ?? accent;
            return (
              <View key={`${entry.date}-${idx}`} style={styles.historyRow}>
                <View style={styles.historyTimeline}>
                  <View style={[styles.historyDot, { backgroundColor: levelColor }]} />
                  {idx < history.length - 1 ? <View style={styles.historyLine} /> : null}
                </View>
                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                    <View style={[styles.scoreChip, { backgroundColor: `${levelColor}22` }]}>
                      <Text style={[styles.scoreChipText, { color: levelColor }]}>{entry.score} pts</Text>
                    </View>
                  </View>
                  <Text style={[styles.historyLevel, { color: levelColor }]}>{levelMeta.label}</Text>
                  {entry.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Bimestre reports */}
      {bimestreReports.map((report: BimestreReport) => {
        const initialColor = theme.colors.literacy[report.initialLevel as keyof typeof theme.colors.literacy] ?? accent;
        const finalColor = theme.colors.literacy[report.finalLevel as keyof typeof theme.colors.literacy] ?? accent;
        const levelvedUp = report.initialLevel !== report.finalLevel;
        return (
          <View key={`${report.year}-${report.bimestre}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.bimestreTitleRow}>
                <Text style={styles.cardTitle}>{report.bimestre}° Bimestre {report.year}</Text>
                {levelvedUp ? (
                  <View style={styles.levelUpBadge}>
                    <Ionicons name="arrow-up" size={10} color="#16a34a" />
                    <Text style={styles.levelUpText}>Avançou de nível</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.bimestreStatsGrid}>
              {[
                { label: 'Sessões', value: String(report.sessionsCompleted) },
                { label: 'Média', value: `${report.averageScore} pts` },
                { label: 'Evolução', value: `+${report.evolution} pts`, positive: true },
              ].map((s) => (
                <View key={s.label} style={styles.bimestreStatItem}>
                  <Text style={[styles.bimestreStatValue, s.positive && { color: '#16a34a' }]}>{s.value}</Text>
                  <Text style={styles.bimestreStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.levelFlowRow}>
              <View style={[styles.levelFlowChip, { backgroundColor: `${initialColor}22` }]}>
                <Text style={[styles.levelFlowText, { color: initialColor }]}>
                  {literacyLevels[report.initialLevel].label}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.neutral[400]} />
              <View style={[styles.levelFlowChip, { backgroundColor: `${finalColor}22` }]}>
                <Text style={[styles.levelFlowText, { color: finalColor }]}>
                  {literacyLevels[report.finalLevel].label}
                </Text>
              </View>
            </View>
            {report.notes ? <Text style={styles.bimestreNotes}>{report.notes}</Text> : null}
          </View>
        );
      })}
    </ScrollView>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab: Atividades                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  audio:   'musical-notes',
  writing: 'pencil',
  reading: 'book',
  game:    'game-controller',
};

const ActivitiesTab = ({ child, accent, accentLight, navigation }: {
  child: Child;
  accent: string;
  accentLight: string;
  navigation: any;
}) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
    {child.activities.length === 0 ? (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={40} color={theme.colors.neutral[300]} />
        <Text style={styles.emptyTitle}>Sem atividades</Text>
        <Text style={styles.emptyDesc}>Nenhuma atividade foi registrada para este estudante ainda.</Text>
      </View>
    ) : (
      child.activities.map((activity, idx) => {
        const completed = activity.completed;
        return (
          <MotiView
            key={activity.id}
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: idx * 60 }}
          >
            <Pressable
              style={styles.activityCard}
              onPress={() => {
                if (activity.type === 'audio' && activity.phrase) {
                  navigation.navigate('Activities', {
                    screen: 'AudioActivity',
                    params: { childId: child.id, activityId: activity.id, phrase: activity.phrase },
                  });
                } else {
                  navigation.navigate('Activities', {
                    screen: 'ActivityDetail',
                    params: { activityId: activity.id, childId: child.id },
                  });
                }
              }}
            >
              <View style={[styles.activityIconBox, { backgroundColor: completed ? '#dcfce7' : accentLight }]}>
                <Ionicons
                  name={typeIcon[activity.type] ?? 'ellipse'}
                  size={20}
                  color={completed ? '#16a34a' : accent}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityMeta}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  {activity.createdAt ? ` • ${formatDate(activity.createdAt)}` : ''}
                </Text>
                {activity.phrase ? (
                  <Text style={[styles.activityPhrase, { color: accent }]}>{activity.phrase}</Text>
                ) : null}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: completed ? '#dcfce7' : theme.colors.neutral[100] }]}>
                <Ionicons
                  name={completed ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color={completed ? '#16a34a' : theme.colors.neutral[400]}
                />
                <Text style={[styles.statusText, { color: completed ? '#16a34a' : theme.colors.neutral[400] }]}>
                  {completed ? 'Feita' : 'Pendente'}
                </Text>
              </View>
            </Pressable>
          </MotiView>
        );
      })
    )}
  </ScrollView>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab: Orientações                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

const guidanceCategoryLabel: Record<string, string> = {
  phonological: 'Consciência fonológica',
  reading:      'Leitura',
  writing:      'Escrita',
  emotional:    'Socioemocional',
  family:       'Família',
  school:       'Escola',
};

const guidanceCategoryIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  phonological: 'musical-notes',
  reading:      'book',
  writing:      'pencil',
  emotional:    'heart',
  family:       'home',
  school:       'school',
};

const GuidanceTab = ({ child, accent, accentLight }: {
  child: Child;
  accent: string;
  accentLight: string;
}) => {
  const guidance = child.individualGuidance ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {guidance.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={40} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Sem orientações</Text>
          <Text style={styles.emptyDesc}>As orientações individualizadas serão exibidas aqui.</Text>
        </View>
      ) : (
        guidance.map((item: IndividualGuidance, idx) => {
          const catIcon = guidanceCategoryIcon[item.category] ?? 'information-circle';
          const catLabel = guidanceCategoryLabel[item.category] ?? item.category;
          return (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: idx * 70 }}
            >
              <View style={styles.guidanceCard}>
                <LinearGradient colors={[accentLight, '#ffffff']} style={styles.guidanceGradient}>
                  <View style={styles.guidanceHeader}>
                    <View style={[styles.guidanceCatBadge, { backgroundColor: accent }]}>
                      <Ionicons name={catIcon} size={12} color="#fff" />
                      <Text style={styles.guidanceCatText}>{catLabel}</Text>
                    </View>
                    {item.createdAt ? (
                      <Text style={styles.guidanceDate}>{formatDate(item.createdAt)}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.guidanceTitle}>{item.title}</Text>
                  <Text style={styles.guidanceContent}>{item.content}</Text>
                </LinearGradient>
              </View>
            </MotiView>
          );
        })
      )}
    </ScrollView>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab: Dados                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

const SPECIAL_NEEDS_ALL: Array<{ key: string; label: string }> = [
  { key: 'autism',             label: 'TEA — Transtorno do Espectro Autista' },
  { key: 'dyslexia',          label: 'Dislexia' },
  { key: 'adhd',              label: 'TDAH — Transtorno de Déficit de Atenção' },
  { key: 'dyscalculia',       label: 'Discalculia' },
  { key: 'visualImpairment',  label: 'Deficiência visual' },
  { key: 'hearingImpairment', label: 'Deficiência auditiva' },
];

const DataTab = ({ child, accent, accentLight }: {
  child: Child;
  accent: string;
  accentLight: string;
}) => {
  const needs = child.specialNeeds ?? {};

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Personal info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle" size={16} color={accent} />
          <Text style={styles.cardTitle}>Informações pessoais</Text>
        </View>
        {[
          { label: 'Nome completo', value: child.name },
          { label: 'Data de nascimento', value: formatDate(child.birthDate) },
          { label: 'Idade', value: `${calculateAge(child.birthDate)} anos` },
          { label: 'Escola', value: child.school ?? '—' },
          { label: 'Turma', value: child.turma ?? '—' },
        ].map((field) => (
          <View key={field.label} style={styles.dataRow}>
            <Text style={styles.dataLabel}>{field.label}</Text>
            <Text style={styles.dataValue}>{field.value}</Text>
          </View>
        ))}
      </View>

      {/* Special needs */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="accessibility" size={16} color={accent} />
          <Text style={styles.cardTitle}>Necessidades especiais</Text>
        </View>
        {SPECIAL_NEEDS_ALL.map((n) => {
          const active = !!(needs as any)[n.key];
          const meta = SPECIAL_NEEDS_LABELS[n.key];
          return (
            <View key={n.key} style={styles.needsCheckRow}>
              <View style={[styles.needsCheckBox, active && { backgroundColor: meta?.bg ?? accentLight }]}>
                {active ? (
                  <Ionicons name="checkmark" size={12} color={meta?.color ?? accent} />
                ) : null}
              </View>
              <Text style={[styles.needsCheckLabel, active && { fontFamily: theme.typography.fonts.primarySemiBold, color: meta?.color ?? accent }]}>
                {n.label}
              </Text>
            </View>
          );
        })}
        {child.specialNeeds?.other ? (
          <View style={styles.needsOther}>
            <Text style={styles.dataLabel}>Outras condições</Text>
            <Text style={styles.dataValue}>{child.specialNeeds.other}</Text>
          </View>
        ) : null}
      </View>

      {/* Tags */}
      {child.tags && child.tags.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="pricetag" size={16} color={accent} />
            <Text style={styles.cardTitle}>Etiquetas</Text>
          </View>
          <View style={styles.tagsWrap}>
            {child.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: accentLight }]}>
                <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Full observations */}
      {child.observations ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={16} color={accent} />
            <Text style={styles.cardTitle}>Observações detalhadas</Text>
          </View>
          <Text style={styles.observationText}>{child.observations}</Text>
        </View>
      ) : null}

      {/* ID info */}
      <View style={[styles.card, { opacity: 0.6 }]}>
        <Text style={styles.dataLabel}>ID anônimo</Text>
        <Text style={[styles.dataValue, { fontFamily: theme.typography.fonts.technical }]}>
          {child.anonId}
        </Text>
      </View>
    </ScrollView>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main screen                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export const ChildDetailScreen = ({ route, navigation }: any) => {
  const childId = route.params?.childId as string;
  const { children } = useChild();
  const child = children.find((item) => item.id === childId);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const contentOpacity = useSharedValue(1);
  const prevTabRef = useRef<TabKey>('overview');

  const handleTabChange = useCallback(
    (key: TabKey) => {
      if (key === prevTabRef.current) return;
      prevTabRef.current = key;
      contentOpacity.value = withTiming(0, { duration: 100 }, () => {
        contentOpacity.value = withTiming(1, { duration: 200 });
      });
      setActiveTab(key);
    },
    [contentOpacity],
  );

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  if (!child) {
    return (
      <View style={styles.container}>
        <Pressable onPress={navigation.goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>Estudante nao encontrado.</Text>
        </View>
      </View>
    );
  }

  const accent      = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
  const accentLight = theme.colors.literacyLight[child.literacyLevel as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[50];
  const gradient    = (theme.colors.gradients.level[child.literacyLevel] ?? theme.colors.gradients.primary) as [string, string];

  return (
    <View style={styles.container}>
      {/* Hero */}
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        {/* Back button */}
        <Pressable onPress={navigation.goBack} style={styles.heroBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
        </Pressable>

        {/* Report shortcut */}
        <Pressable
          onPress={() => navigation.navigate('StudentReport', { childId })}
          style={styles.heroReport}
          hitSlop={8}
        >
          <Ionicons name="document-text" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>

        <MotiView
          from={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          style={styles.avatarWrap}
        >
          <Avatar name={child.name} size="xl" showBorder borderColor="rgba(255,255,255,0.6)" />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.heroInfo}
        >
          <Text style={styles.heroName}>{child.name}</Text>
          <Text style={styles.heroMeta}>
            {calculateAge(child.birthDate)} anos
            {child.turma ? ` • ${child.turma}` : ''}
            {child.school ? `\n${child.school}` : ''}
          </Text>
          <View style={styles.heroBadgeRow}>
            <LevelBadge level={child.literacyLevel} />
          </View>
          <SpecialNeedsBadges needs={child.specialNeeds} />
        </MotiView>
      </LinearGradient>

      {/* Tab bar */}
      <TabBar active={activeTab} accent={accent} onChange={handleTabChange} />

      {/* Tab content */}
      <Animated.View style={[{ flex: 1 }, contentStyle]}>
        {activeTab === 'overview' && (
          <OverviewTab child={child} accent={accent} accentLight={accentLight} gradient={gradient} navigation={navigation} />
        )}
        {activeTab === 'progress' && (
          <ProgressTab child={child} accent={accent} />
        )}
        {activeTab === 'activities' && (
          <ActivitiesTab child={child} accent={accent} accentLight={accentLight} navigation={navigation} />
        )}
        {activeTab === 'guidance' && (
          <GuidanceTab child={child} accent={accent} accentLight={accentLight} />
        )}
        {activeTab === 'data' && (
          <DataTab child={child} accent={accent} accentLight={accentLight} />
        )}
      </Animated.View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  /* Hero */
  hero: {
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -90, right: -70,
  },
  decorCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, left: -40,
  },
  heroBack: {
    position: 'absolute', top: 52, left: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroReport: {
    position: 'absolute', top: 52, right: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarWrap: { marginTop: 8 },
  heroInfo: { alignItems: 'center', gap: 6 },
  heroName: {
    fontSize: 24,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: '#fff',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  heroMeta: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primary,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 18,
  },
  heroBadgeRow: { marginTop: 2 },

  /* Special needs badges */
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
  needsBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  needsBadgeText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
    position: 'relative',
    ...theme.shadows.level1,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[400],
  },

  /* Tab content */
  tabContent: { padding: 16, gap: 14, paddingBottom: 40 },

  /* Cards */
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.text,
    flex: 1,
  },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, borderRadius: theme.borderRadius.lg,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  statValue: { fontSize: 20, fontFamily: theme.typography.fonts.primaryExtraBold },
  statLabel: {
    fontSize: 10, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[500], textAlign: 'center',
  },

  /* Observations */
  observationText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  /* Tags */
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  tagText: { fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold },

  /* Recommendations */
  recRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  urgencyDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  recTitle: { fontSize: 14, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  recDesc: { fontSize: 13, fontFamily: theme.typography.fonts.primary, color: theme.colors.textSecondary, lineHeight: 19, marginTop: 2 },
  recCategory: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, marginTop: 3 },

  /* Actions */
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: theme.borderRadius.lg,
  },
  actionBtnText: { fontSize: 14, fontFamily: theme.typography.fonts.primaryBold, color: '#fff' },
  actionBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5, backgroundColor: theme.colors.surface,
  },
  actionBtnOutlineText: { fontSize: 14, fontFamily: theme.typography.fonts.primaryBold },

  /* Bimestre selector */
  bimestreRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bimestreBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
  },
  bimestreBtnText: {
    fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
  },

  /* Progress history */
  historyRow: { flexDirection: 'row', gap: 12 },
  historyTimeline: { alignItems: 'center', width: 16 },
  historyDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  historyLine: { flex: 1, width: 2, backgroundColor: theme.colors.neutral[100], marginTop: 4 },
  historyContent: { flex: 1, paddingBottom: 16, gap: 3 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { flex: 1, fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  scoreChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.full },
  scoreChipText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold },
  historyLevel: { fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold },
  historyNotes: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500], lineHeight: 18 },

  /* Bimestre report cards */
  bimestreTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  levelUpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  levelUpText: { fontSize: 10, fontFamily: theme.typography.fonts.primarySemiBold, color: '#16a34a' },
  bimestreStatsGrid: { flexDirection: 'row', gap: 8 },
  bimestreStatItem: {
    flex: 1, backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg, padding: 10, alignItems: 'center', gap: 2,
  },
  bimestreStatValue: {
    fontSize: 16, fontFamily: theme.typography.fonts.primaryExtraBold, color: theme.colors.text,
  },
  bimestreStatLabel: { fontSize: 10, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500] },
  levelFlowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelFlowChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full },
  levelFlowText: { fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold },
  bimestreNotes: {
    fontSize: 13, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[500], lineHeight: 19,
    paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },

  /* No data */
  noData: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noDataText: {
    fontSize: 14, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400], textAlign: 'center',
  },

  /* Activity cards */
  activityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl,
    padding: 14, borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1, marginBottom: 2,
  },
  activityIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  activityTitle: { fontSize: 14, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  activityMeta: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },
  activityPhrase: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.full,
  },
  statusText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold },

  /* Guidance */
  guidanceCard: {
    borderRadius: theme.borderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  guidanceGradient: { padding: 16, gap: 10 },
  guidanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guidanceCatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full,
  },
  guidanceCatText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, color: '#fff' },
  guidanceDate: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400], marginLeft: 'auto' },
  guidanceTitle: { fontSize: 15, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.text },
  guidanceContent: {
    fontSize: 14, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary, lineHeight: 22,
  },

  /* Data tab */
  dataRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[100],
  },
  dataLabel: { fontSize: 13, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500] },
  dataValue: { fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text, textAlign: 'right', flex: 1, marginLeft: 12 },
  needsCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  needsCheckBox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: theme.colors.neutral[300],
    alignItems: 'center', justifyContent: 'center',
  },
  needsCheckLabel: { fontSize: 13, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500], flex: 1 },
  needsOther: { paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.neutral[100], gap: 4 },

  /* Empty states */
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 48, gap: 12,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, borderColor: '#f0edf8', borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 16, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.neutral[500] },
  emptyDesc: {
    fontSize: 13, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400], textAlign: 'center', paddingHorizontal: 24, lineHeight: 19,
  },

  /* Not found */
  backBtn: { padding: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundEmoji: { fontSize: 48 },
  notFoundText: { fontSize: 16, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.neutral[500] },
});

export default ChildDetailScreen;
