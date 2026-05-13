import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { Avatar } from '@/components/ui/Avatar';
import { ChildCard } from '@/components/domain/ChildCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useChild } from '@/hooks/useChild';
import { greetingByHour } from '@/utils/formatters';
import { LiteracyLevel, literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';
import type { Child } from '@/@types/navigation';

/* ─── AnimatedCounter ─── */

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const AnimatedCounter = ({
  target, suffix = '', delay: d = 0, style,
}: { target: number; suffix?: string; delay?: number; style?: object }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setDisplay(0);
    timerRef.current = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / 800, 1);
        setDisplay(Math.round(easeOutCubic(p) * target));
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else setDisplay(target);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, d);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, d]);
  return <Text style={style}>{display}{suffix}</Text>;
};

/* ─── Helpers ─── */

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatDate = () =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

const LEVEL_ORDER: Record<string, number> = {
  [LiteracyLevel.PRE_SILABICO]: 0,
  [LiteracyLevel.SILABICO_SEM_VALOR]: 1,
  [LiteracyLevel.SILABICO_COM_VALOR]: 2,
  [LiteracyLevel.SILABICO_ALFABETICO]: 3,
  [LiteracyLevel.ALFABETICO]: 4,
};

const expectedLevel = (ageYears: number): number => {
  if (ageYears <= 5) return 0;
  if (ageYears <= 6) return 1;
  if (ageYears <= 7) return 2;
  return 3;
};

const calcAge = (birthDate: string) => {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())
  ) age--;
  return age;
};

/* ─── Quick action button ─── */

const QuickAction = ({
  icon, label, color, bg, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; bg: string; onPress: () => void }) => (
  <Pressable style={[styles.qaBtn, { backgroundColor: bg }]} onPress={onPress}>
    <View style={[styles.qaIconBox, { backgroundColor: color }]}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <Text style={[styles.qaLabel, { color }]}>{label}</Text>
  </Pressable>
);

/* ─── Alert card ─── */

const AlertCard = ({ child, message, onPress }: { child: Child; message: string; onPress: () => void }) => {
  const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
  return (
    <Pressable style={styles.alertCard} onPress={onPress}>
      <Avatar name={child.name} size="sm" showBorder borderColor={accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.alertName}>{child.name}</Text>
        <Text style={styles.alertMsg}>{message}</Text>
      </View>
      <View style={[styles.alertLevelDot, { backgroundColor: accent }]} />
      <Ionicons name="chevron-forward" size={14} color={theme.colors.neutral[400]} />
    </Pressable>
  );
};

/* ─── Turma card (teacher) ─── */

const TurmaCard = ({
  turma, children: turmaChildren, onPress,
}: { turma: string; children: Child[]; onPress: () => void }) => {
  const avg = Math.round(turmaChildren.reduce((s, c) => s + c.progress, 0) / Math.max(1, turmaChildren.length));
  const neeCount = turmaChildren.filter((c) => c.specialNeeds && Object.values(c.specialNeeds).some(Boolean)).length;
  return (
    <Pressable style={styles.turmaCard} onPress={onPress}>
      <LinearGradient colors={['#f5f3ff', '#ede9fe']} style={styles.turmaCardGrad}>
        <View style={styles.turmaCardHeader}>
          <View style={styles.turmaIconBox}>
            <Ionicons name="people" size={16} color={theme.colors.primary[600]} />
          </View>
          <Text style={styles.turmaName}>{turma}</Text>
          <View style={styles.turmaBadge}>
            <Text style={styles.turmaBadgeText}>{turmaChildren.length}</Text>
          </View>
        </View>
        <View style={styles.turmaStats}>
          {[
            { v: avg + '%', l: 'Média' },
            { v: String(turmaChildren.filter((c) => c.progress >= 60).length), l: 'Acima 60%' },
            { v: String(neeCount), l: 'Com NEE' },
          ].map((s) => (
            <View key={s.l} style={styles.turmaStat}>
              <Text style={styles.turmaStatValue}>{s.v}</Text>
              <Text style={styles.turmaStatLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.turmaProgressTrack}>
          <View style={[styles.turmaProgressFill, { width: `${avg}%` }]} />
        </View>
        <Text style={styles.turmaCta}>Ver turma →</Text>
      </LinearGradient>
    </Pressable>
  );
};

/* ─── TEACHER DASHBOARD ─── */

const TeacherDashboard = ({ navigation, children }: { navigation: any; children: Child[] }) => {
  const turmas = useMemo(() => {
    const map = new Map<string, Child[]>();
    children.forEach((c) => {
      const key = c.turma ?? 'Sem turma';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).map(([turma, list]) => ({ turma, children: list }));
  }, [children]);

  const alerts = useMemo(() =>
    children
      .filter((c) => {
        const age = calcAge(c.birthDate);
        const exp = expectedLevel(age);
        const actual = LEVEL_ORDER[c.literacyLevel] ?? 0;
        return actual < exp || c.progress < 25;
      })
      .slice(0, 4),
  [children]);

  const totalActivities = children.reduce((s, c) => s + c.activities.length, 0);
  const completed = children.reduce((s, c) => s + c.activities.filter((a) => a.completed).length, 0);
  const avgProgress = Math.round(children.reduce((s, c) => s + c.progress, 0) / Math.max(1, children.length));
  const needsCount = children.filter((c) => c.specialNeeds && Object.values(c.specialNeeds).some(Boolean)).length;

  return (
    <>
      {/* Quick actions */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 180 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.qaRow}>
            <QuickAction icon="add-circle" label="Atividade" color={theme.colors.primary[600]} bg={theme.colors.primary[50]}
              onPress={() => navigation.navigate('Activities', { screen: 'CreateActivity' })} />
            <QuickAction icon="clipboard" label="Avaliação" color="#16a34a" bg="#dcfce7"
              onPress={() => navigation.navigate('Children', { screen: 'Assessment' })} />
            <QuickAction icon="bulb" label="Orientação" color="#0284c7" bg="#dbeafe"
              onPress={() => navigation.navigate('Guidance', { screen: 'CreateGuidance' })} />
            <QuickAction icon="people" label="Turmas" color={theme.colors.secondary[600]} bg={theme.colors.secondary[50]}
              onPress={() => navigation.navigate('Children')} />
          </View>
        </View>
      </MotiView>

      {/* Stats grid */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 240 }}>
        <View style={styles.statsGrid}>
          {[
            { v: children.length, l: 'Total alunos',  icon: 'people'        as const, color: theme.colors.primary[600] },
            { v: turmas.length,   l: 'Turmas',         icon: 'library'       as const, color: theme.colors.secondary[500] },
            { v: needsCount,      l: 'Com NEE',        icon: 'accessibility' as const, color: '#7c3aed' },
            { v: avgProgress,     l: 'Progresso méd.', icon: 'trending-up'   as const, color: '#16a34a', suffix: '%' },
          ].map((s, i) => (
            <MotiView key={s.l} from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 280 + i * 50 }}>
              <View style={[styles.statGridCard, { borderTopColor: s.color }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
                <AnimatedCounter target={s.v} suffix={(s as any).suffix ?? ''} delay={320 + i * 60} style={[styles.statGridValue, { color: s.color }]} />
                <Text style={styles.statGridLabel}>{s.l}</Text>
              </View>
            </MotiView>
          ))}
        </View>
      </MotiView>

      {/* Alerts */}
      {alerts.length > 0 ? (
        <MotiView from={{ opacity: 0, translateX: -12 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 340 }}>
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <View style={[styles.alertPulse, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Atenção necessária</Text>
              <View style={styles.alertCountBadge}>
                <Text style={styles.alertCountText}>{alerts.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>Alunos abaixo do nível esperado para a idade</Text>
            {alerts.map((child, i) => {
              const age = calcAge(child.birthDate);
              const exp = expectedLevel(age);
              const actual = LEVEL_ORDER[child.literacyLevel] ?? 0;
              const expKey = Object.keys(LEVEL_ORDER).find((k) => LEVEL_ORDER[k] === exp) as LiteracyLevel | undefined;
              const msg = actual < exp
                ? `Esperado "${literacyLevels[expKey!]?.label ?? ''}" aos ${age} anos`
                : `Progresso baixo: ${child.progress}%`;
              return (
                <MotiView key={child.id} from={{ opacity: 0, translateX: -8 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 380 + i * 60 }}>
                  <AlertCard
                    child={child}
                    message={msg}
                    onPress={() => navigation.navigate('Children', { screen: 'ChildDetail', params: { childId: child.id } })}
                  />
                </MotiView>
              );
            })}
          </View>
        </MotiView>
      ) : null}

      {/* Turma cards */}
      {turmas.length > 0 ? (
        <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 420 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minhas turmas</Text>
            {turmas.map((t, i) => (
              <MotiView key={t.turma} from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 460 + i * 70 }}>
                <TurmaCard turma={t.turma} children={t.children} onPress={() => navigation.navigate('Children')} />
              </MotiView>
            ))}
          </View>
        </MotiView>
      ) : null}

      {/* Activity summary */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }}>
        <View style={styles.activitySummaryCard}>
          <View style={styles.activitySummaryTop}>
            <Ionicons name="book" size={16} color={theme.colors.primary[600]} />
            <Text style={styles.sectionTitle}>Atividades da turma</Text>
          </View>
          <View style={styles.activitySummaryStats}>
            {[
              { v: completed, l: 'Concluídas', color: '#16a34a' },
              { v: totalActivities - completed, l: 'Pendentes', color: theme.colors.secondary[500] },
              { v: totalActivities, l: 'Total', color: theme.colors.primary[600] },
            ].map((s, idx) => (
              <React.Fragment key={s.l}>
                {idx > 0 ? <View style={styles.activityStatDiv} /> : null}
                <View style={styles.activityStat}>
                  <Text style={[styles.activityStatVal, { color: s.color }]}>{s.v}</Text>
                  <Text style={styles.activityStatLabel}>{s.l}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          <View style={styles.activityProgressTrack}>
            <View style={[styles.activityProgressFill, {
              width: totalActivities > 0 ? `${Math.round((completed / totalActivities) * 100)}%` : '0%',
            }]} />
          </View>
          <Text style={styles.activityProgressPct}>
            {totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0}% de conclusão
          </Text>
        </View>
      </MotiView>
    </>
  );
};

/* ─── GUARDIAN DASHBOARD ─── */

const GuardianDashboard = ({ navigation, children }: { navigation: any; children: Child[] }) => {
  const allRecs = useMemo(() => children.flatMap((c) => c.recommendations).slice(0, 3), [children]);
  const pendingTotal = children.reduce((s, c) => s + c.activities.filter((a) => !a.completed).length, 0);
  const avgProgress = Math.round(children.reduce((s, c) => s + c.progress, 0) / Math.max(1, children.length));

  return (
    <>
      {/* Quick actions */}
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 180 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.qaRow}>
            <QuickAction icon="add-circle" label="Atividade" color={theme.colors.primary[600]} bg={theme.colors.primary[50]}
              onPress={() => navigation.navigate('Activities', { screen: 'CreateActivity' })} />
            <QuickAction icon="clipboard" label="Avaliar" color="#16a34a" bg="#dcfce7"
              onPress={() => navigation.navigate('Children', { screen: 'Assessment' })} />
            <QuickAction icon="git-network" label="Trilhas" color="#0284c7" bg="#dbeafe"
              onPress={() => navigation.navigate('Children')} />
            <QuickAction icon="person-add" label="Adicionar" color={theme.colors.secondary[600]} bg={theme.colors.secondary[50]}
              onPress={() => navigation.navigate('Children', { screen: 'AddChild' })} />
          </View>
        </View>
      </MotiView>

      {/* Summary strip */}
      {children.length > 0 ? (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 240 }}>
          <View style={styles.summaryStrip}>
            {[
              { v: children.length, l: 'Estudantes',      color: theme.colors.primary[600] },
              { v: pendingTotal,    l: 'Pendentes',      color: theme.colors.secondary[500] },
              { v: avgProgress,     l: 'Progresso méd.', color: '#16a34a', suffix: '%' },
            ].map((s, i) => (
              <View key={s.l} style={styles.summaryItem}>
                <AnimatedCounter target={s.v} suffix={(s as any).suffix ?? ''} delay={280 + i * 60} style={[styles.summaryVal, { color: s.color }]} />
                <Text style={styles.summaryLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </MotiView>
      ) : null}

      {/* Children list */}
      <View style={styles.section}>
        <MotiView from={{ opacity: 0, translateX: -8 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 300 }}>
          <View style={styles.sectionRow}>
            <View style={[styles.sectionAccent, { backgroundColor: theme.colors.primary[600] }]} />
            <Text style={styles.sectionTitle}>Estudantes</Text>
            {children.length > 0 ? (
              <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>{children.length}</Text></View>
            ) : null}
          </View>
        </MotiView>

        {children.length === 0 ? (
          <EmptyState
            title="Nenhum estudante cadastrado"
            description="Adicione o primeiro estudante para comecar o acompanhamento."
            actionLabel="Adicionar estudante"
            onAction={() => navigation.navigate('Children', { screen: 'AddChild' })}
          />
        ) : (
          <View style={styles.list}>
            {children.map((child, i) => (
              <MotiView
                key={child.id}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 16, stiffness: 200, delay: 340 + i * 70 }}
              >
                <ChildCard
                  child={child}
                  onPress={() => navigation.navigate('Children', { screen: 'ChildDetail', params: { childId: child.id } })}
                />
              </MotiView>
            ))}
          </View>
        )}
      </View>

      {/* Recommendations */}
      {allRecs.length > 0 ? (
        <MotiView from={{ opacity: 0, translateX: 12 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 480 }}>
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <View style={[styles.sectionAccent, { backgroundColor: theme.colors.secondary[500] }]} />
              <Text style={styles.sectionTitle}>Recomendações de hoje</Text>
            </View>
            {allRecs.map((rec, i) => {
              const urgencyColor = rec.urgency === 'high' ? '#ef4444' : rec.urgency === 'medium' ? '#f59e0b' : '#22c55e';
              return (
                <MotiView key={rec.id} from={{ opacity: 0, translateX: 10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 520 + i * 60 }}>
                  <View style={styles.recCard}>
                    <View style={[styles.recDot, { backgroundColor: urgencyColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recTitle}>{rec.title}</Text>
                      <Text style={styles.recDesc}>{rec.description}</Text>
                      {rec.category ? <Text style={[styles.recCat, { color: urgencyColor }]}>{rec.category}</Text> : null}
                    </View>
                    {rec.urgency === 'high' ? (
                      <View style={styles.urgentBadge}><Text style={styles.urgentText}>Urgente</Text></View>
                    ) : null}
                  </View>
                </MotiView>
              );
            })}
          </View>
        </MotiView>
      ) : null}
    </>
  );
};

/* ─── Main screen ─── */

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { children, fetchChildren, loading } = useChild();
  const isTeacher = user?.role === 'teacher';

  useEffect(() => { void fetchChildren(); }, [fetchChildren]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void fetchChildren()} tintColor={theme.colors.primary[600]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <LinearGradient
          colors={isTeacher ? ['#1e1b4b', '#4c1d95'] : ['#312e81', '#6d28d9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <MotiView from={{ opacity: 0, translateY: -6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 60 }} style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroRole}>
                {isTeacher ? '👩‍🏫 Modo professor' : '👨‍👩‍👧 Modo responsável'}
              </Text>
              <Text style={styles.heroGreeting}>{greetingByHour(user?.name?.split(' ')[0] ?? 'Educador')} 👋</Text>
              <Text style={styles.heroDate}>{capitalize(formatDate())}</Text>
            </View>
            {user?.name ? (
              <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 14, delay: 100 }}>
                <Avatar name={user.name} size="md" showBorder borderColor="rgba(255,255,255,0.6)" />
              </MotiView>
            ) : null}
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 160 }}>
            <View style={styles.heroTagRow}>
              {isTeacher ? (
                <>
                  <View style={styles.heroTag}><Ionicons name="school" size={12} color="rgba(255,255,255,0.9)" /><Text style={styles.heroTagText}>Professor(a)</Text></View>
                  <View style={styles.heroTag}><Ionicons name="people" size={12} color="rgba(255,255,255,0.9)" /><Text style={styles.heroTagText}>{children.length} alunos</Text></View>
                </>
              ) : (
                <>
                  <View style={styles.heroTag}><Ionicons name="heart" size={12} color="rgba(255,255,255,0.9)" /><Text style={styles.heroTagText}>Responsável</Text></View>
                  <View style={styles.heroTag}><Ionicons name="people" size={12} color="rgba(255,255,255,0.9)" /><Text style={styles.heroTagText}>{children.length} estudante{children.length !== 1 ? 's' : ''}</Text></View>
                </>
              )}
            </View>
          </MotiView>
        </LinearGradient>

        {/* Role-specific content */}
        <View style={styles.content}>
          {isTeacher ? (
            <TeacherDashboard navigation={navigation} children={children} />
          ) : (
            <GuardianDashboard navigation={navigation} children={children} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

/* ─── Styles ─── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  /* Hero */
  hero: {
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 14,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -100, right: -80,
  },
  heroCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -70, left: -50,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroRole: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroGreeting: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  heroDate: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primary,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    lineHeight: 18,
  },
  heroTagRow: { flexDirection: 'row', gap: 8 },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroTagText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, color: 'rgba(255,255,255,0.9)' },

  /* Content */
  content: { gap: 0 },

  /* Sections */
  section: { paddingHorizontal: 16, paddingTop: 22, gap: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionAccent: { width: 3, height: 18, borderRadius: 2 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[500],
    lineHeight: 17,
    marginTop: -4,
  },
  sectionBadge: {
    backgroundColor: theme.colors.primary[50], borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  sectionBadgeText: { fontSize: 12, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.primary[600] },
  list: { gap: 12 },

  /* Quick actions */
  qaRow: { flexDirection: 'row', gap: 8 },
  qaBtn: {
    flex: 1, alignItems: 'center', gap: 6, padding: 12,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  qaIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  qaLabel: { fontSize: 10, fontFamily: theme.typography.fonts.primaryBold, textAlign: 'center', lineHeight: 14 },

  /* Stats grid (teacher) */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 16, paddingTop: 18,
  },
  statGridCard: {
    width: '47%', backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 14, alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: '#f0edf8',
    borderTopWidth: 3,
    ...theme.shadows.level1,
  },
  statGridValue: { fontSize: 26, fontFamily: theme.typography.fonts.primaryExtraBold, letterSpacing: -0.5 },
  statGridLabel: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500], textAlign: 'center' },

  /* Alerts */
  alertPulse: { width: 8, height: 8, borderRadius: 4 },
  alertCountBadge: {
    backgroundColor: '#ef4444', borderRadius: theme.borderRadius.full,
    paddingHorizontal: 7, paddingVertical: 1,
  },
  alertCountText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold, color: '#fff' },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff7f7', borderRadius: theme.borderRadius.lg,
    padding: 12, borderWidth: 1, borderColor: '#fecaca',
  },
  alertName: { fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  alertMsg: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: '#dc2626', lineHeight: 16, marginTop: 1 },
  alertLevelDot: { width: 8, height: 8, borderRadius: 4 },

  /* Turma cards */
  turmaCard: { borderRadius: theme.borderRadius.xl, overflow: 'hidden', ...theme.shadows.level1 },
  turmaCardGrad: { padding: 16, gap: 12, borderWidth: 1, borderColor: '#e0d7ff', borderRadius: theme.borderRadius.xl },
  turmaCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  turmaIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center', justifyContent: 'center',
  },
  turmaName: { flex: 1, fontSize: 15, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.text, letterSpacing: -0.2 },
  turmaBadge: {
    backgroundColor: theme.colors.primary[600], borderRadius: theme.borderRadius.full,
    paddingHorizontal: 9, paddingVertical: 2,
  },
  turmaBadgeText: { fontSize: 12, fontFamily: theme.typography.fonts.primaryBold, color: '#fff' },
  turmaStats: { flexDirection: 'row' },
  turmaStat: { flex: 1, alignItems: 'center' },
  turmaStatValue: { fontSize: 19, fontFamily: theme.typography.fonts.primaryExtraBold, color: theme.colors.primary[700] },
  turmaStatLabel: { fontSize: 10, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500] },
  turmaProgressTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(124,58,237,0.12)', overflow: 'hidden' },
  turmaProgressFill: { height: 5, borderRadius: 3, backgroundColor: theme.colors.primary[600] },
  turmaCta: { fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.primary[600], textAlign: 'right' },

  /* Activity summary */
  activitySummaryCard: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: '#f0edf8', ...theme.shadows.level1,
  },
  activitySummaryTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activitySummaryStats: { flexDirection: 'row', alignItems: 'center' },
  activityStat: { flex: 1, alignItems: 'center', gap: 2 },
  activityStatVal: { fontSize: 22, fontFamily: theme.typography.fonts.primaryExtraBold, letterSpacing: -0.5 },
  activityStatLabel: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500] },
  activityStatDiv: { width: 1, height: 36, backgroundColor: theme.colors.neutral[100] },
  activityProgressTrack: { height: 6, borderRadius: 3, backgroundColor: theme.colors.neutral[100], overflow: 'hidden' },
  activityProgressFill: { height: 6, borderRadius: 3, backgroundColor: theme.colors.primary[600] },
  activityProgressPct: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.neutral[500], textAlign: 'right' },

  /* Guardian summary strip */
  summaryStrip: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 3 },
  summaryVal: { fontSize: 22, fontFamily: theme.typography.fonts.primaryExtraBold, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 10, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500] },

  /* Recommendations */
  recCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: 14, borderWidth: 1, borderColor: '#f0edf8', ...theme.shadows.level1,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  recTitle: { fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  recDesc: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500], lineHeight: 18, marginTop: 2 },
  recCat: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, marginTop: 2 },
  urgentBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  urgentText: { fontSize: 10, fontFamily: theme.typography.fonts.primaryBold, color: '#dc2626' },
});

export default DashboardScreen;
