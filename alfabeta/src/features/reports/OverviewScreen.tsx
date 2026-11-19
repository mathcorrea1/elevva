import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SlidersHorizontal, FileChartColumn, ClipboardList } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field } from '@/shared/ui';
import { useDebounced } from '@/shared/data/paged';
import { Sheet } from '@/shared/ui/Sheet';
import { SectionTitle, Badge, MenuRow, Pills } from '@/shared/ui/learning';
import { ScreenTitle, Metrics } from '@/shared/ui/presentation';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { useWorkspace } from '@/app/Workspace';
import { ContextPicker, contextQuery } from '@/features/workspace/ContextPicker';
import { PeriodFilter } from './PeriodFilter';
import { TrendChart as TimelineChart } from './TrendChart';
import { EvidenceGroups } from './EvidenceGroups';
import type { Overview } from './overviewTypes';
import { categoryLabel } from './overviewTypes';
import type { ScreenProps } from '@/app/routes';
type Filters = { student_id: string; level: string; skill: string; support: string };
const empty: Filters = { student_id: '', level: '', skill: '', support: '' };
export function OverviewScreen({ navigation }: ScreenProps<'Reports'>) {
  const { value, update, profession } = useWorkspace();
  const { colors } = useTheme();
  const [filters, setFilters] = useState(empty);
  const [draft, setDraft] = useState(empty);
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('summary');
  const [method, setMethod] = useState(false);
  const searchQuery = useDebounced(search);
  const teacher = profession === 'teacher';
  useEffect(() => {
    setFilters(empty);
    setDraft(empty);
  }, [value.schoolId, value.classroomId]);
  const params = new URLSearchParams(teacher ? contextQuery(value).slice(1) : '');
  if (!teacher) {
    if (value.start) params.set('start', value.start);
    if (value.end) params.set('end', value.end);
  }
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  params.set('offset', String(offset));
  if (searchQuery) params.set('search', searchQuery);
  useEffect(
    () => setOffset(0),
    [searchQuery, filters, value.schoolId, value.classroomId, value.start, value.end],
  );
  const data = useResource<Overview>('/reports/overview?' + params.toString());
  const active = Object.values(filters).filter(Boolean).length;
  return (
    <Page>
      <ScreenTitle
        title="Relatórios"
        subtitle={
          teacher
            ? 'Um olhar para cada descoberta da turma.'
            : 'Acompanhe cada estudante, no seu ritmo.'
        }
        action={
          <Action
            secondary
            icon={SlidersHorizontal}
            title={active ? 'Filtros · ' + active : 'Filtros'}
            onPress={() => {
              setDraft(filters);
              setOpen(true);
            }}
          />
        }
      />
      {teacher ? (
        <ContextPicker />
      ) : (
        <PeriodFilter
          start={value.start}
          end={value.end}
          apply={(start, end) => update({ start, end })}
        />
      )}
      <Pills
        value={section}
        onChange={setSection}
        options={[
          { value: 'summary', label: 'Resumo' },
          { value: 'students', label: 'Estudantes' },
          { value: 'evidence', label: 'Evidências' },
        ]}
      />
      <LoadState resource={data} />
      {teacher && !value.schoolId && (
        <Card>
          <Copy heading>Qual contexto vamos acompanhar?</Copy>
          <Copy muted>
            Selecione sua escola e, se desejar, uma turma para reunir os registros autorizados.
          </Copy>
        </Card>
      )}
      {data.data && (!teacher || !!value.schoolId) && (
        <>
          {section === 'summary' && (
            <>
              <Metrics
                items={[
                  { value: data.data.totals.students || 0, label: 'Estudantes' },
                  { value: data.data.totals.completed_tasks || 0, label: 'Tarefas concluídas' },
                  {
                    value: data.data.totals.pending_assessments || 0,
                    label: 'Avaliações a registrar',
                  },
                ]}
              />
              <TimelineChart series={data.data.series} />
              <Card>
                <Copy heading>Pontos de partida</Copy>
                <Copy muted size="caption">
                  Distribuição dos níveis confirmados entre {data.data.pagination.total} estudantes
                  do filtro.
                </Copy>
                {data.data.level_distribution.map((d) => (
                  <View key={d.level} style={{ gap: 6 }}>
                    <Copy>
                      {categoryLabel(d.level)} · {d.count}
                    </Copy>
                    <View
                      aria-hidden
                      accessible={false}
                      style={{
                        height: 8,
                        backgroundColor: colors.divider,
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: 8,
                          width: ((data.data!.pagination.total
                            ? (d.count / data.data!.pagination.total) * 100
                            : 0) + '%') as `${number}%`,
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                  </View>
                ))}
                {!data.data.level_distribution.length && (
                  <Copy muted>Ainda não há estudantes neste filtro.</Copy>
                )}
              </Card>
              <SectionTitle title="Próximos passos" />
              {data.data.students
                .filter((s) => s.attention.length)
                .slice(0, 3)
                .map((s) => (
                  <MenuRow
                    key={s.id}
                    icon={ClipboardList}
                    title={s.name}
                    detail={s.attention[0].reason}
                    onPress={() => navigation.navigate(s.attention[0].action, { student: s })}
                  />
                ))}
              {!data.data.students.some((s) => s.attention.length) && (
                <Copy muted>Nenhuma pendência de registro na página atual.</Copy>
              )}
              <Action
                secondary
                title="Ver estudantes e registros"
                onPress={() => setSection('students')}
              />
              {teacher && !!value.classroomId && (
                <MenuRow
                  icon={FileChartColumn}
                  title="Relatório coletivo e PDF"
                  detail="Resumo autorizado da turma selecionada"
                  onPress={() =>
                    navigation.navigate('Collective', {
                      classroomId: value.classroomId,
                      title: 'Turma selecionada',
                    })
                  }
                />
              )}
            </>
          )}
          {section === 'students' && (
            <>
              <Field
                label="Buscar estudante no relatório"
                value={search}
                onChangeText={setSearch}
                maxLength={120}
              />
              <Copy muted size="caption">
                {data.data.students.length} de {data.data.pagination.total} estudantes neste filtro.
              </Copy>
              {data.data.students.map((s) => (
                <MenuRow
                  key={s.id}
                  icon={FileChartColumn}
                  title={s.name}
                  detail={
                    categoryLabel(s.category) + ' · ' + s.completed_tasks + ' tarefas concluídas'
                  }
                  onPress={() =>
                    navigation.navigate('Report', {
                      student: s,
                      classroomId: teacher ? value.classroomId || undefined : undefined,
                    })
                  }
                />
              ))}
              {!data.data.students.length && (
                <Copy muted>
                  Nenhum estudante corresponde à busca. Experimente limpar os filtros.
                </Copy>
              )}
            </>
          )}
          {section === 'evidence' && (
            <>
              <SectionTitle title="Habilidades e respostas" detail={data.data.detail_scope} />
              <EvidenceGroups groups={data.data.comparable_groups} />
              {data.data.observed_support.map((o) => (
                <Card key={o.evidence_id}>
                  <Badge text="OBSERVAÇÃO DO ADULTO" />
                  <Copy heading>{o.skill}</Copy>
                  <Copy>{o.text}</Copy>
                  <Copy muted size="caption">
                    {o.support || 'Apoio não informado'} ·{' '}
                    {new Date(o.date).toLocaleDateString('pt-BR')}
                  </Copy>
                  {data.data!.students.some((s) => s.id === o.student_id) && (
                    <Action
                      secondary
                      title="Abrir evidências do estudante"
                      onPress={() => {
                        const student = data.data!.students.find((s) => s.id === o.student_id)!;
                        navigation.navigate('Report', {
                          student,
                          classroomId: teacher ? value.classroomId || undefined : undefined,
                        });
                      }}
                    />
                  )}
                </Card>
              ))}
              {!data.data.comparable_groups.length && !data.data.observed_support.length && (
                <Copy muted>Ainda não há evidências comparáveis nesta página e período.</Copy>
              )}
            </>
          )}
          {section !== 'summary' && data.data.pagination.total > data.data.pagination.limit && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Action
                secondary
                title="Anterior"
                disabled={!offset}
                onPress={() => setOffset(Math.max(0, offset - data.data!.pagination.limit))}
              />
              <Action
                secondary
                title="Próxima"
                disabled={data.data.pagination.next_offset == null}
                onPress={() => setOffset(data.data!.pagination.next_offset!)}
              />
            </View>
          )}
          <Action quiet title="Como ler estes dados" onPress={() => setMethod(true)} />
        </>
      )}
      <Sheet visible={method} title="Sobre os registros" close={() => setMethod(false)}>
        <Copy>
          Os gráficos reúnem entregas, avaliações e observações registradas. Contagem de tarefas não
          é percentual de alfabetização.
        </Copy>
        <Copy>
          Nível confirmado, sugestão da IA e correção de um exercício são informações diferentes.
          Respostas aguardando revisão não contam automaticamente como erro.
        </Copy>
        {!!data.data && (
          <>
            <Copy>{data.data.detail_scope}</Copy>
            <Copy>{data.data.assessment_freshness.note}</Copy>
            {data.data.limitations.map((l) => (
              <Copy muted key={l}>
                {l}
              </Copy>
            ))}
          </>
        )}
      </Sheet>
      <Sheet
        visible={open}
        title="Filtrar acompanhamento"
        close={() => setOpen(false)}
        footer={
          <Action
            title="Aplicar filtros de acompanhamento"
            onPress={() => {
              setFilters(draft);
              setOpen(false);
            }}
          />
        }
      >
        <Copy>Estudante</Copy>
        <Pills
          value={draft.student_id}
          options={[
            { value: '', label: 'Todos do contexto' },
            ...(data.data?.options.students || []).map((s) => ({ value: s.id, label: s.name })),
          ]}
          onChange={(student_id) => setDraft({ ...draft, student_id })}
        />
        <Copy>Situação do nível confirmado</Copy>
        <Pills
          value={draft.level}
          options={[
            { value: '', label: 'Todas' },
            ...[
              'unassessed',
              'unconfirmed',
              'pre-silabico',
              'silabico',
              'silabico-sem-valor',
              'silabico-com-valor',
              'silabico-alfabetico',
              'alfabetico',
            ].map((level) => ({ value: level, label: categoryLabel(level) })),
          ]}
          onChange={(level) => setDraft({ ...draft, level })}
        />
        <Copy>Habilidade cadastrada</Copy>
        <Pills
          value={draft.skill}
          options={[
            { value: '', label: 'Todas as habilidades' },
            ...(data.data?.options.skills || []).map((skill) => ({ value: skill, label: skill })),
          ]}
          onChange={(skill) => setDraft({ ...draft, skill })}
        />
        <Copy>Apoio fornecido no cadastro</Copy>
        <Pills
          value={draft.support}
          options={[
            { value: '', label: 'Todos os apoios' },
            ...(data.data?.options.supports || []).map((support) => ({
              value: support,
              label: support,
            })),
          ]}
          onChange={(support) => setDraft({ ...draft, support })}
        />
        <Copy muted>
          Apoio é informação cadastrada, não condição inferida. Filtros não alteram nível, matrícula
          ou classificação.
        </Copy>

        <Action
          secondary
          title="Limpar filtros de acompanhamento"
          onPress={() => setDraft(empty)}
        />
        <Action quiet title="Cancelar alterações" onPress={() => setOpen(false)} />
      </Sheet>
    </Page>
  );
}
