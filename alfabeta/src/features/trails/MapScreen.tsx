import { useRef, useState } from 'react';
import { View, Pressable, Text, useWindowDimensions, type ScrollView } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { Check, Lock, Play, LocateFixed, List, Map, Flag } from 'lucide-react-native';
import { Page, Copy, Action, Card } from '@/shared/ui';
import { Eyebrow, Badge } from '@/shared/ui/learning';
import { useTheme, tokens,PresentationScope } from '@/shared/theme/ThemeProvider';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import type { ScreenProps } from '@/app/routes';
import { Illustration } from './Illustration';
import type { TrailMap, Care } from './types';
export const lessonStates = {
  available: 'Disponível',
  in_progress: 'Em andamento',
  locked: 'Bloqueada',
  completed: 'Concluída',
};
export function MapScreen({ route, navigation }: ScreenProps<'TrailMap'>) {
  const { student, enrollmentId } = route.params;
  const { colors, preferences, reducedMotion } = useTheme();
  const dimensions = useWindowDimensions();
  const data = useResource<TrailMap>('/students/' + student.id + '/trails/' + enrollmentId);
  const care = useResource<Care>('/students/' + student.id + '/care');
  const [linear, setLinear] = useState(false);
  const [mapWidth, setMapWidth] = useState(350);
  const [focused, setFocused] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const mapY = useRef(0);
  const nodes = useRef<Record<string, View | null>>({});
  const stages = data.data?.journey.stages || [];
  const forceList =
    dimensions.width < 350 ||
    Math.max(preferences.font_scale, care.data?.presentation.font_scale || 1) *
      dimensions.fontScale >
      1.25 ||
    !!care.data?.presentation.prefer_linear;
  const list = linear || forceList;
  const spacing = 260;
  const first = 90;
  const points = stages.map((_, i) => ({
    x: mapWidth * (i % 2 === 0 ? 0.26 : 0.74),
    y: first + i * spacing,
  }));
  const path = points
    .map((p, i) =>
      i === 0
        ? `M ${p.x} ${p.y}`
        : `C ${mapWidth * (i % 2 ? 0.93 : 0.07)} ${points[i - 1].y} ${mapWidth * (i % 2 ? 0.07 : 0.93)} ${p.y} ${p.x} ${p.y}`,
    )
    .join(' ');
  const current = stages.findIndex((s) => s.state === 'available' || s.state === 'in_progress');
  function locate() {
    if (current < 0) return;
    scroll.current?.scrollTo({ y: mapY.current + current * spacing, animated: !reducedMotion });
    nodes.current[stages[current].id]?.focus();
  }
  return (
    <PresentationScope fontScale={care.data?.presentation.font_scale}><Page scrollRef={scroll}>
      <LoadState resource={data} />
      {data.data && (
        <>
          <Eyebrow>{student.name.toLocaleUpperCase('pt-BR')} · SUA TRILHA</Eyebrow>
          <Copy heading headingLevel={1} size="display">
            {data.data.title}
          </Copy>
          <View style={{ borderRadius: 24, overflow: 'hidden' }}>
            <Illustration
              image={data.data.cover || { builtin: data.data.scenario, alt: '' }}
              height={140}
              cover
            />
          </View>
          <Badge
            text={
              stages.filter((s) => s.state === 'completed').length +
              ' de ' +
              stages.length +
              ' aulas concluídas'
            }
          />
          <Copy muted>{data.data.description}</Copy>
          <Action
            icon={LocateFixed}
            title={current < 0 ? 'Todas as aulas foram concluídas' : 'Localizar próxima aula'}
            disabled={current < 0}
            onPress={locate}
          />
          <Action
            secondary
            icon={list ? Map : List}
            title={
              forceList
                ? 'Lista adaptada para este perfil e tamanho de texto'
                : list
                  ? 'Ver mapa ilustrado'
                  : 'Ver lista de aulas'
            }
            disabled={forceList}
            onPress={() => setLinear(!linear)}
          />
          <View
            onLayout={(e) => {
              setMapWidth(Math.min(e.nativeEvent.layout.width, 620));
              mapY.current = e.nativeEvent.layout.y;
            }}
            style={{ width: '100%', maxWidth: 620, alignSelf: 'center', gap: list ? 16 : 0 }}
          >
            {!list && (
              <Svg
                pointerEvents="none"
                aria-hidden={true}
                width="100%"
                height={stages.length * spacing + 20}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <Path
                  d={path}
                  stroke={preferences.contrast ? colors.border : colors.accent}
                  strokeWidth={32}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d={path}
                  stroke={preferences.contrast ? colors.background : colors.onAccent}
                  strokeOpacity={preferences.contrast ? 1 : 0.18}
                  strokeWidth={2}
                  fill="none"
                />
                {stages.map((s, i) => {
                  const x = i % 2 === 0 ? mapWidth * 0.9 : mapWidth * 0.1;
                  const y = first + i * spacing + 130;
                  return (
                    <Svg
                      key={s.id}
                      x={x - 22}
                      y={y - 45}
                      width={44}
                      height={75}
                      viewBox="0 0 44 75"
                    >
                      <Path
                        d="M22 72 Q18 40 23 18"
                        stroke={colors.success}
                        strokeWidth={4}
                        fill="none"
                      />
                      <Ellipse
                        cx={12}
                        cy={46}
                        rx={10}
                        ry={5}
                        fill={colors.success}
                        transform="rotate(25 12 46)"
                      />
                      <Ellipse
                        cx={31}
                        cy={32}
                        rx={10}
                        ry={5}
                        fill={colors.success}
                        transform="rotate(-25 31 32)"
                      />
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Circle
                          key={n}
                          cx={22 + 9 * Math.cos(n * Math.PI * 0.4)}
                          cy={15 + 9 * Math.sin(n * Math.PI * 0.4)}
                          r={7}
                          fill={data.data!.scenario === 'sky' ? colors.primary : colors.accent}
                        />
                      ))}
                      <Circle cx={22} cy={15} r={5} fill={colors.onAccent} />
                    </Svg>
                  );
                })}
              </Svg>
            )}
            {stages.map((stage, i) => {
              const Icon =
                stage.state === 'completed'
                  ? Check
                  : stage.state === 'locked'
                    ? Lock
                    : stage.state === 'in_progress'
                      ? Play
                      : Flag;
              return (
                <View
                  key={stage.id}
                  style={{
                    height: list ? undefined : spacing,
                    minHeight: list ? 180 : undefined,
                    alignItems: list ? 'stretch' : 'flex-start',
                  }}
                >
                  <Pressable
                    ref={(node) => {
                      nodes.current[stage.id] = node;
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      'Aula ' +
                      (i + 1) +
                      ': ' +
                      stage.title +
                      '. ' +
                      lessonStates[stage.state] +
                      '. ' +
                      stage.completed +
                      ' de ' +
                      stage.total +
                      ' atividades. ' +
                      (i === current ? 'Próxima aula.' : '')
                    }
                    onFocus={() => setFocused(stage.id)}
                    onBlur={() => setFocused(null)}
                    onPress={() =>
                      navigation.navigate('Lesson', { student, enrollmentId, lessonId: stage.id })
                    }
                    style={({ pressed }) => ({
                      width: list ? '100%' : 148,
                      position: list ? 'relative' : 'absolute',
                      left: list ? 0 : points[i].x - 74,
                      top: list ? 0 : first - 60,
                      alignItems: 'center',
                      padding: 10,
                      gap: 8,
                      borderRadius: 26,
                      borderWidth: 2,
                      borderColor:
                        focused === stage.id ? colors.focus : list ? colors.divider : 'transparent',
                      backgroundColor: list ? colors.surface : 'transparent',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 108,
                        height: 108,
                        borderRadius: 28,
                        backgroundColor: colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: i === current ? 3 : 1,
                        borderColor: i === current ? colors.primary : colors.border,
                      }}
                    >
                      <Illustration
                        image={
                          stage.lesson?.image || {
                            builtin: (
                              ['sprout', 'butterfly', 'boat', 'milestone', 'lumi'] as const
                            )[i % 5],
                            alt: '',
                          }
                        }
                        width={96}
                        height={96}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          right: -6,
                          bottom: -6,
                          padding: 7,
                          borderRadius: 12,
                          backgroundColor:
                            stage.state === 'completed' ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Icon
                          size={16}
                          color={stage.state === 'completed' ? colors.onPrimary : colors.primary}
                        />
                      </View>
                    </View>
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: tokens.fontSemibold,
                        fontSize: 15 * preferences.font_scale,
                        lineHeight: 21 * preferences.font_scale,
                        textAlign: 'center',
                      }}
                    >
                      {stage.title}
                    </Text>
                    <Text
                      style={{
                        color: colors.secondary,
                        fontFamily: tokens.fontFamily,
                        fontSize: 12 * preferences.font_scale,
                        textAlign: 'center',
                      }}
                    >
                      {lessonStates[stage.state]} · {stage.completed}/{stage.total}
                    </Text>
                    {i === current && <Badge text="SUA PRÓXIMA DESCOBERTA" />}
                  </Pressable>
                </View>
              );
            })}
          </View>
          <Card>
            <Copy heading>Descobertas registradas</Copy>
            <Copy>
              {data.data.journey.completed_tasks} tarefas concluídas entre{' '}
              {data.data.journey.total_tasks} atribuídas.
            </Copy>
            <Copy muted>
              Acertos e condições de aplicação ficam separados por atividade. Conclusão da trilha
              não altera nível de alfabetização.
            </Copy>
            {data.data.journey.achievements.map((a) => (
              <Copy key={a.id}>
                {a.title} · {a.description}
              </Copy>
            ))}
          </Card>
        </>
      )}
    </Page></PresentationScope>
  );
}
