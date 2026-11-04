import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
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

const ALERT_VISIBLE_COUNT = 4;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type CounterProps = {
  target: number;
  suffix?: string;
  delay?: number;
  style?: object;
};

const AnimatedCounter = ({ target, suffix = '', delay = 0, style }: CounterProps) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplay(0);
    timerRef.current = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const progress = Math.min((Date.now() - start) / 750, 1);
        setDisplay(Math.round(easeOutCubic(progress) * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        setDisplay(target);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [delay, target]);

  return <Text style={style}>{display}{suffix}</Text>;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

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
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
};

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => (
  <Pressable style={styles.quickActionButton} onPress={onPress}>
    <View style={styles.quickActionIconBox}>
      <Ionicons name={icon} size={18} color={theme.colors.primary[700]} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </Pressable>
);

type AlertCardProps = {
  child: Child;
  message: string;
  onPress: () => void;
};

const AlertCard = ({ child, message, onPress }: AlertCardProps) => {
  const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[700];

  return (
    <Pressable style={styles.alertCard} onPress={onPress}>
      <Avatar name={child.name} size="sm" showBorder borderColor={accent} />
      <View style={styles.alertContent}>
        <Text style={styles.alertName}>{child.name}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
      <View style={[styles.alertLevelDot, { backgroundColor: accent }]} />
      <Ionicons name="chevron-forward" size={14} color={theme.colors.neutral[400]} />
    </Pressable>
  );
};

type TurmaCardProps = {
  turma: string;
  children: Child[];
  onPress: () => void;
};

const TurmaCard = ({ turma, children: turmaChildren, onPress }: TurmaCardProps) => {
  const avgProgress = Math.round(
    turmaChildren.reduce((sum, child) => sum + child.progress, 0) / Math.max(1, turmaChildren.length),
  );
  const specialNeedsCount = turmaChildren.filter(
    (child) => child.specialNeeds && Object.values(child.specialNeeds).some(Boolean),
  ).length;

  return (
    <Pressable style={styles.turmaCard} onPress={onPress}>
      <View style={styles.turmaHeader}>
        <View style={styles.turmaIconBox}>
          <Ionicons name="people" size={16} color={theme.colors.primary[700]} />
        </View>
        <Text style={styles.turmaName}>{turma}</Text>
        <View style={styles.turmaBadge}>
          <Text style={styles.turmaBadgeText}>{turmaChildren.length}</Text>
        </View>
      </View>

      <View style={styles.turmaStats}>
        {[
          { value: `${avgProgress}%`, label: 'Média' },
          { value: String(turmaChildren.filter((child) => child.progress >= 60).length), label: 'Acima 60%' },
          { value: String(specialNeedsCount), label: 'Com NEE' },
        ].map((item) => (
          <View key={item.label} style={styles.turmaStat}>
            <Text style={styles.turmaStatValue}>{item.value}</Text>
            <Text style={styles.turmaStatLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.turmaProgressTrack}>
        <View style={[styles.turmaProgressFill, { width: `${avgProgress}%` }]} />
      </View>

      <Text style={styles.turmaCta}>Ver turma</Text>
    </Pressable>
  );
};

type DashboardProps = { navigation: any; children: Child[] };

const TeacherDashboard = ({ navigation, children }: DashboardProps) => {
  const [alertsExpanded, setAlertsExpanded] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const turmas = useMemo(() => {
    const grouped = new Map<string, Child[]>();
    children.forEach((child) => {
      const key = child.turma ?? 'Sem turma';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(child);
    });

    return Array.from(grouped.entries()).map(([turma, turmaChildren]) => ({
      turma,
      children: turmaChildren,
    }));
  }, [children]);

  const alerts = useMemo(
    () =>
      children
        .filter((child) => {
          const age = calcAge(child.birthDate);
          const expected = expectedLevel(age);
          const actual = LEVEL_ORDER[child.literacyLevel] ?? 0;
          return actual < expected || child.progress < 25;
        })
        .slice(0, ALERT_VISIBLE_COUNT),
    [children],
  );

  const totalActivities = children.reduce((sum, child) => sum + child.activities.length, 0);
  const completedActivities = children.reduce(
    (sum, child) => sum + child.activities.filter((activity) => activity.completed).length,
    0,
  );
  const avgProgress = Math.round(children.reduce((sum, child) => sum + child.progress, 0) / Math.max(1, children.length));
  const specialNeedsCount = children.filter(
    (child) => child.specialNeeds && Object.values(child.specialNeeds).some(Boolean),
  ).length;

  const toggleAlerts = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAlertsExpanded((prev) => !prev);
  };

  const activityCompletionPct = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  return (
    <>
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 180 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.quickActionRow}>
            <QuickAction
              icon="add-circle"
              label="Atividade"
              onPress={() => navigation.navigate('Activities', { screen: 'CreateActivity' })}
            />
            <QuickAction
              icon="clipboard"
              label="Avaliação"
              onPress={() => navigation.navigate('Children', { screen: 'Assessment' })}
            />
            <QuickAction
              icon="bulb"
              label="Orientação"
              onPress={() => navigation.navigate('Guidance', { screen: 'CreateGuidance' })}
            />
            <QuickAction icon="people" label="Turmas" onPress={() => navigation.navigate('Children')} />
          </View>
        </View>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 230 }}>
        <View style={styles.statsGrid}>
          {[
            { value: children.length, label: 'Total alunos', icon: 'people' as const },
            { value: turmas.length, label: 'Turmas', icon: 'library' as const },
            { value: specialNeedsCount, label: 'Com NEE', icon: 'accessibility' as const },
            { value: avgProgress, label: 'Progresso méd.', icon: 'trending-up' as const, suffix: '%' },
          ].map((item, index) => (
            <MotiView
              key={item.label}
              style={styles.statGridItem}
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 260 + index * 45 }}
            >
              <View style={styles.statGridCard}>
                <Ionicons name={item.icon} size={16} color={theme.colors.primary[700]} />
                <AnimatedCounter
                  target={item.value}
                  suffix={item.suffix ?? ''}
                  delay={280 + index * 50}
                  style={styles.statGridValue}
                />
                <Text style={styles.statGridLabel}>{item.label}</Text>
              </View>
            </MotiView>
          ))}
        </View>
      </MotiView>

      {alerts.length > 0 ? (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 320 }}>
          <View style={styles.section}>
            <View style={styles.alertContainer}>
              <Pressable style={styles.alertHeader} onPress={toggleAlerts}>
                <View style={styles.alertHeaderLeft}>
                  <View style={styles.alertPulse} />
                  <Text style={styles.alertTitle}>Atenção necessária</Text>
                </View>
                <View style={styles.alertHeaderRight}>
                  <View style={styles.alertCountBadge}>
                    <Text style={styles.alertCountText}>{alerts.length}</Text>
                  </View>
                  <Ionicons
                    name={alertsExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.colors.neutral[500]}
                  />
                </View>
              </Pressable>

              <Text style={styles.alertSubtitle}>Alunos abaixo do nível esperado para a idade</Text>

              {alertsExpanded ? (
                <View style={styles.alertList}>
                  {alerts.map((child) => {
                    const age = calcAge(child.birthDate);
                    const expected = expectedLevel(age);
                    const actual = LEVEL_ORDER[child.literacyLevel] ?? 0;
                    const expectedLevelKey = Object.keys(LEVEL_ORDER).find(
                      (key) => LEVEL_ORDER[key] === expected,
                    ) as LiteracyLevel | undefined;

                    const message =
                      actual < expected
                        ? `Esperado "${literacyLevels[expectedLevelKey!]?.label ?? ''}" aos ${age} anos`
                        : `Progresso baixo: ${child.progress}%`;

                    return (
                      <AlertCard
                        key={child.id}
                        child={child}
                        message={message}
                        onPress={() =>
                          navigation.navigate('Children', { screen: 'ChildDetail', params: { childId: child.id } })
                        }
                      />
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        </MotiView>
      ) : null}

      {turmas.length > 0 ? (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 360 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minhas turmas</Text>
            <View style={styles.turmaList}>
              {turmas.map((item, index) => (
                <MotiView
                  key={item.turma}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 390 + index * 60 }}
                >
                  <TurmaCard turma={item.turma} children={item.children} onPress={() => navigation.navigate('Children')} />
                </MotiView>
              ))}
            </View>
          </View>
        </MotiView>
      ) : null}

      <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 420 }}>
        <View style={styles.activitySummaryCard}>
          <View style={styles.activitySummaryTop}>
            <Ionicons name="book" size={16} color={theme.colors.primary[700]} />
            <Text style={styles.sectionTitle}>Atividades da turma</Text>
          </View>

          <View style={styles.activitySummaryStats}>
            {[
              { value: completedActivities, label: 'Concluídas' },
              { value: totalActivities - completedActivities, label: 'Pendentes' },
              { value: totalActivities, label: 'Total' },
            ].map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 ? <View style={styles.activityDivider} /> : null}
                <View style={styles.activityStat}>
                  <Text style={styles.activityStatValue}>{item.value}</Text>
                  <Text style={styles.activityStatLabel}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.activityProgressTrack}>
            <View style={[styles.activityProgressFill, { width: `${activityCompletionPct}%` }]} />
          </View>
          <Text style={styles.activityProgressText}>{activityCompletionPct}% de conclusão</Text>
        </View>
      </MotiView>
    </>
  );
};

const GuardianDashboard = ({ navigation, children }: DashboardProps) => {
  const recommendations = useMemo(() => children.flatMap((child) => child.recommendations).slice(0, 3), [children]);
  const pendingActivities = children.reduce((sum, child) => sum + child.activities.filter((activity) => !activity.completed).length, 0);
  const avgProgress = Math.round(children.reduce((sum, child) => sum + child.progress, 0) / Math.max(1, children.length));

  return (
    <>
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 180 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.quickActionRow}>
            <QuickAction icon="add-circle" label="Atividade" onPress={() => navigation.navigate('Activities', { screen: 'CreateActivity' })} />
            <QuickAction icon="clipboard" label="Avaliar" onPress={() => navigation.navigate('Children', { screen: 'Assessment' })} />
            <QuickAction icon="git-network" label="Trilhas" onPress={() => navigation.navigate('Children')} />
            <QuickAction icon="person-add" label="Adicionar" onPress={() => navigation.navigate('Children', { screen: 'AddChild' })} />
          </View>
        </View>
      </MotiView>

      {children.length > 0 ? (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 240 }}>
          <View style={styles.summaryStrip}>
            {[
              { value: children.length, label: 'Estudantes' },
              { value: pendingActivities, label: 'Pendentes' },
              { value: avgProgress, label: 'Progresso méd.', suffix: '%' },
            ].map((item, index) => (
              <View key={item.label} style={styles.summaryItem}>
                <AnimatedCounter
                  target={item.value}
                  suffix={item.suffix ?? ''}
                  delay={280 + index * 60}
                  style={styles.summaryValue}
                />
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </MotiView>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Estudantes</Text>
          {children.length > 0 ? (
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{children.length}</Text>
            </View>
          ) : null}
        </View>

        {children.length === 0 ? (
          <EmptyState
            title="Nenhum estudante cadastrado"
            description="Adicione o primeiro estudante para começar o acompanhamento."
            actionLabel="Adicionar estudante"
            onAction={() => navigation.navigate('Children', { screen: 'AddChild' })}
          />
        ) : (
          <View style={styles.childList}>
            {children.map((child, index) => (
              <MotiView
                key={child.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 320 + index * 70 }}
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

      {recommendations.length > 0 ? (
        <MotiView from={{ opacity: 0, translateX: 8 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 450 }}>
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Recomendações de hoje</Text>
            </View>
            <View style={styles.recommendationList}>
              {recommendations.map((rec) => (
                <View key={rec.id} style={styles.recommendationCard}>
                  <View style={styles.recommendationDot} />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </MotiView>
      ) : null}
    </>
  );
};

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { children, fetchChildren, loading } = useChild();
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void fetchChildren()} tintColor={theme.colors.primary[600]} />}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={isTeacher ? theme.colors.gradients.hero : theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroCircleTop} />
          <View style={styles.heroCircleBottom} />

          <MotiView
            from={{ opacity: 0, translateY: -6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 60 }}
            style={styles.heroTop}
          >
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroRole}>{isTeacher ? 'Modo professor' : 'Modo responsável'}</Text>
              <Text style={styles.heroGreeting}>{greetingByHour(user?.name?.split(' ')[0] ?? 'Educador')} 👋</Text>
              <Text style={styles.heroDate}>{capitalize(formatDate())}</Text>
            </View>

            {user?.name ? (
              <MotiView
                from={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 100, type: 'spring', damping: 14 }}
              >
                <Avatar name={user.name} size="md" showBorder borderColor="rgba(255,255,255,0.55)" />
              </MotiView>
            ) : null}
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 140 }}>
            <View style={styles.heroTags}>
              {isTeacher ? (
                <>
                  <View style={styles.heroTag}>
                    <Ionicons name="school" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroTagText}>Professor(a)</Text>
                  </View>
                  <View style={styles.heroTag}>
                    <Ionicons name="people" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroTagText}>{children.length} alunos</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.heroTag}>
                    <Ionicons name="heart" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroTagText}>Responsável</Text>
                  </View>
                  <View style={styles.heroTag}>
                    <Ionicons name="people" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroTagText}>
                      {children.length} estudante{children.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </MotiView>
        </LinearGradient>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 36 },
  content: { gap: 0 },

  hero: {
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 20,
    gap: 14,
    overflow: 'hidden',
  },
  heroCircleTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -110,
    right: -70,
  },
  heroCircleBottom: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -70,
    left: -40,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTextBlock: { flex: 1 },
  heroRole: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroGreeting: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: '#ffffff',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  heroDate: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primary,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
    lineHeight: 18,
  },
  heroTags: { flexDirection: 'row', gap: 8 },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroTagText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: 'rgba(255,255,255,0.92)',
  },

  section: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 18, borderRadius: 2, backgroundColor: theme.colors.primary[600] },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.primary[700],
  },

  quickActionRow: { flexDirection: 'row', gap: 8 },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
  },
  quickActionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[100],
  },
  quickActionLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.primaryBold,
    textAlign: 'center',
    lineHeight: 14,
    color: theme.colors.textSecondary,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  statGridItem: { width: '48.4%' },
  statGridCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 14,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary[500],
    ...theme.shadows.level1,
  },
  statGridValue: {
    fontSize: 26,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.primary[800],
    letterSpacing: -0.5,
  },
  statGridLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  alertContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    padding: 12,
    gap: 8,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.error,
    letterSpacing: -0.2,
  },
  alertCountBadge: {
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  alertCountText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.error,
  },
  alertSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
  },
  alertList: { gap: 8 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  alertContent: { flex: 1 },
  alertName: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.text,
  },
  alertMessage: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.error,
    lineHeight: 16,
    marginTop: 1,
  },
  alertLevelDot: { width: 8, height: 8, borderRadius: 4 },

  turmaList: { gap: 10 },
  turmaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    padding: 14,
    gap: 12,
    ...theme.shadows.level1,
  },
  turmaHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  turmaIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[100],
  },
  turmaName: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  turmaBadge: {
    backgroundColor: theme.colors.primary[700],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  turmaBadgeText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primaryBold,
    color: '#ffffff',
  },
  turmaStats: { flexDirection: 'row' },
  turmaStat: { flex: 1, alignItems: 'center' },
  turmaStatValue: {
    fontSize: 19,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.primary[700],
  },
  turmaStatLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
  },
  turmaProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.neutral[100],
    overflow: 'hidden',
  },
  turmaProgressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.primary[600],
  },
  turmaCta: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.primary[700],
    textAlign: 'right',
  },

  activitySummaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.level1,
  },
  activitySummaryTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activitySummaryStats: { flexDirection: 'row', alignItems: 'center' },
  activityStat: { flex: 1, alignItems: 'center', gap: 2 },
  activityStatValue: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.primary[700],
    letterSpacing: -0.5,
  },
  activityStatLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
  },
  activityDivider: { width: 1, height: 36, backgroundColor: theme.colors.neutral[200] },
  activityProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.neutral[100],
    overflow: 'hidden',
  },
  activityProgressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary[600],
  },
  activityProgressText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },

  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.level1,
  },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 3 },
  summaryValue: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    letterSpacing: -0.5,
    color: theme.colors.primary[700],
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
  },

  childList: { gap: 12 },
  recommendationList: { gap: 8 },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.level1,
  },
  recommendationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: theme.colors.primary[600],
  },
  recommendationContent: { flex: 1 },
  recommendationTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.text,
  },
  recommendationDescription: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
});

export default DashboardScreen;
