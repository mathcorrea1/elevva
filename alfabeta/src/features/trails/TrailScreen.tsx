import { useState } from 'react';
import { View, Text, Pressable, Image, useWindowDimensions } from 'react-native';
import { Check, Lock, Play, Star, Plus, List, Map } from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { Badge, Eyebrow, SectionTitle } from '@/shared/ui/learning';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import type { Content, Journey, JourneyStage } from '@/shared/contracts';
import { useResource, useCommand } from '@/shared/data/hooks';
import type { ScreenProps as Props } from '@/app/routes';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { garden, milestone } from '@/assets/journey';
import { Reading } from '@/features/accessibility/Reading';
import Svg, { Path } from 'react-native-svg';
const labels = {
  completed: 'Concluída',
  locked: 'Bloqueada',
  available: 'Pronta para começar',
  in_progress: 'Em andamento',
};
export function TrailScreen({ route, navigation }: Props<'LegacyTrail'>) {
  const { colors, preferences } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { student } = route.params;
  const data = useResource<Journey>('/students/' + student.id + '/journey?legacy=true');
  const catalog = useResource<Content[]>('/content');
  const save = useCommand();
  const [selected, setSelected] = useState<JourneyStage | null>(null);
  const [linear, setLinear] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ids, setIds] = useState<string[]>([]);
  const [focusedStage, setFocusedStage] = useState<string | null>(null);
  const forceList = preferences.font_scale * fontScale > 1.25 || width < 350;
  const list = linear || forceList;
  const [positions, setPositions] = useState<
    Record<string, { rowY?: number; x?: number; localY?: number }>
  >({});
  function updatePosition(id: string, patch: { rowY?: number; x?: number; localY?: number }) {
    setPositions((current) => {
      const old = current[id] || {};
      if (Object.entries(patch).every(([key, value]) => old[key as keyof typeof old] === value))
        return current;
      return { ...current, [id]: { ...old, ...patch } };
    });
  }
  const points = (data.data?.stages || [])
    .map((s) => positions[s.id])
    .filter((p) => p?.rowY !== undefined && p.x !== undefined && p.localY !== undefined)
    .map((p) => ({ x: p.x!, y: p.rowY! + p.localY! }));
  const curve = points
    .map((p, i) =>
      i === 0
        ? `M${p.x},${p.y}`
        : `C${points[i - 1].x},${(p.y + points[i - 1].y) / 2} ${p.x},${(p.y + points[i - 1].y) / 2} ${p.x},${p.y}`,
    )
    .join(' ');
  return (
    <Page>
      <Eyebrow>A JORNADA DE {student.name.toLocaleUpperCase('pt-BR')}</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Toda descoberta{'\n'}abre um caminho.
      </Copy>
      <View style={{ borderRadius: 26, overflow: 'hidden', backgroundColor: colors.primarySoft }}>
        <Image source={garden} accessible={false} style={{ width: '100%', height: 170 }} />
        <View style={{ padding: 18, gap: 8, backgroundColor: colors.surface }}>
          <Copy heading>Jardim das descobertas</Copy>
          <Copy muted>
            {data.data
              ? `${data.data.completed_tasks} de ${data.data.total_tasks} tarefas concluídas e salvas`
              : 'Carregando sua jornada…'}
          </Copy>
        </View>
      </View>
      <LoadState resource={data} />
      {data.data?.assessment_required && (
        <Card>
          <Copy heading>Primeiro, vamos nos conhecer</Copy>
          <Copy muted>
            A avaliação inicial registra o ponto de partida. Não é preciso inventar um nível.
          </Copy>
          <Action
            title="Registrar avaliação inicial"
            onPress={() => navigation.navigate('Assessment', { student })}
          />
        </Card>
      )}
      <Action
        secondary
        icon={list ? Map : List}
        title={
          forceList
            ? 'Lista adaptada ao texto e à tela'
            : list
              ? 'Ver caminho visual'
              : 'Ver lista acessível'
        }
        disabled={forceList}
        onPress={() => setLinear(!linear)}
      />
      {preferences.font_scale * fontScale > 1.25 && (
        <Copy muted>A lista está ativa para acomodar o texto ampliado.</Copy>
      )}
      {data.data?.stages.length === 0 && (
        <Card>
          <Copy heading>Vamos desenhar este caminho?</Copy>
          <Copy muted>O adulto pode criar uma etapa com atividades relacionadas.</Copy>
        </Card>
      )}
      <View style={{ gap: list ? 16 : 0, maxWidth: 620, width: '100%', alignSelf: 'center' }}>
        {!list && points.length > 1 && (
          <Svg
            pointerEvents="none"
            aria-hidden={true}
            width="100%"
            height={points[points.length - 1].y + 100}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Path
              d={curve}
              fill="none"
              stroke={colors.border}
              strokeWidth={5}
              strokeDasharray="2 13"
              strokeLinecap="round"
            />
          </Svg>
        )}
        {data.data?.stages.map((stage, index) => {
          const Icon =
            stage.state === 'completed'
              ? Check
              : stage.state === 'locked'
                ? Lock
                : stage.state === 'in_progress'
                  ? Play
                  : Star;
          const position = index % 4;
          const align = position === 1 ? 'flex-start' : position === 3 ? 'flex-end' : 'center';
          return (
            <View
              key={stage.id}
              onLayout={(event) => updatePosition(stage.id, { rowY: event.nativeEvent.layout.y })}
              style={{
                alignItems: list ? 'stretch' : align,
                paddingHorizontal: list ? 0 : 24,
                paddingBottom: list ? 0 : 22,
              }}
            >
              <Pressable
                onLayout={(event) =>
                  updatePosition(stage.id, {
                    x: event.nativeEvent.layout.x + event.nativeEvent.layout.width / 2,
                    localY: event.nativeEvent.layout.y + 55,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={
                  'Etapa ' +
                  (index + 1) +
                  ': ' +
                  stage.title +
                  '. ' +
                  labels[stage.state] +
                  '. ' +
                  stage.completed +
                  ' de ' +
                  stage.total +
                  ' tarefas concluídas. Abrir detalhes.'
                }
                onPress={() => setSelected(stage)}
                onFocus={() => setFocusedStage(stage.id)}
                onBlur={() => setFocusedStage(null)}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  gap: 12,
                  padding: list ? 20 : 8,
                  borderRadius: 24,
                  backgroundColor: list ? colors.surface : 'transparent',
                  borderWidth: 2,
                  borderColor:
                    focusedStage === stage.id
                      ? colors.focus
                      : list
                        ? colors.divider
                        : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                  maxWidth: '100%',
                  width: list ? '100%' : 200,
                })}
              >
                <View
                  style={{
                    width: list ? 64 : 90,
                    height: list ? 64 : 90,
                    borderRadius: list ? 24 : 45,
                    backgroundColor:
                      stage.state === 'completed' || stage.state === 'in_progress'
                        ? colors.primary
                        : colors.primarySoft,
                    borderWidth: 3,
                    borderColor: stage.state === 'locked' ? colors.border : colors.primary,
                    borderBottomWidth: 7,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    size={list ? 26 : 34}
                    color={
                      stage.state === 'completed' || stage.state === 'in_progress'
                        ? colors.onPrimary
                        : colors.primary
                    }
                  />
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: colors.background,
                    borderRadius: 16,
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.secondary,
                      fontFamily: tokens.fontMedium,
                      fontSize: 12 * preferences.font_scale,
                    }}
                  >
                    ETAPA {index + 1} · {labels[stage.state]}
                  </Text>
                  <Copy heading>{stage.title}</Copy>
                  <Copy muted>
                    {stage.completed} de {stage.total} atividades
                  </Copy>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
      {!!data.data?.achievements.length && (
        <>
          <SectionTitle
            title="Descobertas que ficam"
            detail="Marcos de participação, separados do nível pedagógico."
          />
          {data.data.achievements.map((a) => (
            <Card key={a.id}>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <Image source={milestone} accessible={false} style={{ width: 70, height: 70 }} />
                <View style={{ flex: 1 }}>
                  <Copy heading>{a.title}</Copy>
                  <Copy muted>{a.description}</Copy>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
      <Action
        secondary
        icon={Plus}
        title="Criar etapa de atividades"
        onPress={() => setAdding(true)}
      />
      <Sheet
        visible={!!selected}
        title={selected?.title || 'Etapa'}
        close={() => setSelected(null)}
      >
        {selected && (
          <>
            <Badge text={labels[selected.state]} />
            <Copy>{selected.description}</Copy>
            <Copy muted>
              {selected.completed} de {selected.total} tarefas concluídas.
            </Copy>
            {selected.tasks.map((task) => (
              <Card key={task.id}>
                <Copy heading>{task.title}</Copy>
                <Badge text={labels[task.state]} />
                <Copy>{task.instructions}</Copy>
                <Copy muted>{task.item_count} itens · uma resposta por vez</Copy>
                <Reading text={task.instructions} />
                <Copy muted>Libras: vídeo revisado ainda não disponível para esta instrução.</Copy>
                {task.block_reason && <Notice text={task.block_reason} />}
                <Action
                  title={
                    task.completed_at
                      ? 'Ver registro salvo'
                      : task.state === 'in_progress'
                        ? 'Continuar atividade'
                        : 'Começar atividade'
                  }
                  disabled={task.locked}
                  onPress={() => {
                    setSelected(null);
                    if (task.completed_at) navigation.navigate('History', { student });
                    else navigation.navigate('Execute', { student, assignment: task });
                  }}
                />
              </Card>
            ))}
          </>
        )}
      </Sheet>
      <Sheet visible={adding} title="Uma nova etapa" close={() => setAdding(false)}>
        <Copy>
          Reúna até seis atividades relacionadas. A escolha deve ser adequada ao estudante e revisada
          pelo adulto.
        </Copy>
        <Field label="Nome da etapa" value={title} onChangeText={setTitle} maxLength={120} />
        <Field
          label="O que vamos descobrir?"
          value={description}
          onChangeText={setDescription}
          maxLength={500}
        />
        <LoadState resource={catalog} />
        {catalog.data
          ?.filter(
            (c) =>
              c.kind === 'activity' &&
              !c.archived_at &&
              ['synthetic', 'published'].includes(c.status),
          )
          .map((c) => (
            <Action
              key={c.id}
              secondary
              selected={ids.includes(c.id)}
              title={(ids.includes(c.id) ? '✓ ' : '') + c.title}
              onPress={() =>
                setIds((current) =>
                  current.includes(c.id)
                    ? current.filter((id) => id !== c.id)
                    : current.length < 6
                      ? [...current, c.id]
                      : current,
                )
              }
            />
          ))}
        <Copy muted>Exemplos sintéticos não equivalem a conteúdo pedagógico aprovado.</Copy>
        <Action
          title="Salvar etapa"
          disabled={save.busy || title.trim().length < 2 || !ids.length}
          onPress={() =>
            void save.run(
              '/students/' + student.id + '/stages',
              { title, description, content_ids: ids },
              async () => {
                setAdding(false);
                setTitle('');
                setDescription('');
                setIds([]);
                await data.reload();
              },
            )
          }
        />
        <SaveState command={save} />
      </Sheet>
    </Page>
  );
}
