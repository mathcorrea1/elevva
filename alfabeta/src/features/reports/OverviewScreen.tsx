import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SlidersHorizontal, FileChartColumn, ClipboardList, Route } from 'lucide-react-native';
import { Page, Card, Copy, Action, Notice, Field } from '@/shared/ui';
import { useDebounced } from '@/shared/data/paged';
import { Sheet } from '@/shared/ui/Sheet';
import {
  Eyebrow,
  SectionTitle,
  Stat,
  Badge,
  MenuRow,
  Pills,
  Disclosure,
} from '@/shared/ui/learning';
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
      <Eyebrow>
        {teacher ? 'UM OLHAR PARA O CONTEXTO ESCOLAR' : 'CADA ESTUDANTE, SUA PRÓPRIA JORNADA'}
      </Eyebrow>
      <Copy heading headingLevel={1} size="display">
        {teacher ? 'Panorama da turma' : 'Como estão as descobertas?'}
      </Copy>
      <Copy muted>
        {teacher
          ? 'Veja os registros antes de aprofundar cada estudante. Nenhum gráfico substitui a análise das evidências.'
          : 'Próximos passos dos estudantes que você acompanha, com linguagem simples e dados próprios.'}
      </Copy>
      {teacher ? (
        <ContextPicker />
      ) : (
        <PeriodFilter
          start={value.start}
          end={value.end}
          apply={(start, end) => update({ start, end })}
        />
      )}
      <Action
        secondary
        icon={SlidersHorizontal}
        title={
          active
            ? 'Filtros de acompanhamento · ' + active + ' ativos'
            : 'Filtrar estudantes e evidências'
        }
        onPress={() => {
          setDraft(filters);
          setOpen(true);
        }}
      />
      {active > 0 && (
        <Badge
          text={Object.entries(filters)
            .filter(([, v]) => v)
            .map(([k, v]) =>
              k === 'student_id'
                ? data.data?.options.students.find((s) => s.id === v)?.name ||
                  'Estudante selecionado'
                : k === 'level'
                  ? categoryLabel(v)
                  : v,
            )
            .join(' · ')}
        />
      )}
      <LoadState resource={data} />
      <Field
        label="Buscar estudante no panorama"
        value={search}
        onChangeText={setSearch}
        maxLength={120}
      />
      {teacher && !value.schoolId && (
        <Notice text="Selecione sua escola para abrir o panorama. Você pode reunir as turmas autorizadas da escola ou escolher uma turma específica." />
      )}
      {data.data && (!teacher || !!value.schoolId) && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Stat
              value={data.data.totals.students || 0}
              label={teacher ? 'Estudantes autorizados' : 'Estudantes acompanhados'}
            />
            <Stat value={data.data.totals.assessments || 0} label="Avaliações no período" />
            <Stat
              value={data.data.totals.pending_assessments || 0}
              label="Avaliações iniciais pendentes"
            />
            <Stat value={data.data.totals.pending_reviews || 0} label="Análises a revisar" />
          </View>
          <Card>
            <Copy heading>Onde estamos hoje</Copy>
            <Copy muted>
              Distribuição dos níveis confirmados e das situações sem confirmação. Denominador:{' '}
              {data.data.pagination.total}{' '}
              {teacher ? 'estudantes autorizados' : 'estudantes vinculados'} do filtro.
            </Copy>
            {data.data.level_distribution.map((d) => (
              <View key={d.level} style={{ gap: 7 }}>
                <Copy>
                  {categoryLabel(d.level)}: {d.count}
                </Copy>
                <View
                  aria-hidden={true}
                  accessible={false}
                  style={{
                    height: 12,
                    backgroundColor: colors.divider,
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: 12,
                      width: `${data.data?.pagination.total ? (d.count / data.data.pagination.total) * 100 : 0}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
              </View>
            ))}
            {!data.data.level_distribution.length && (
              <Copy>Nenhum estudante corresponde ao contexto e aos filtros atuais.</Copy>
            )}
            <Copy size="caption" muted>
              Azul: quantidade de estudantes nesta categoria. Não mede percentual de alfabetização.
            </Copy>
          </Card>
          <TimelineChart series={data.data.series} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Stat
              value={data.data.totals.completed_tasks || 0}
              label="Tarefas concluídas no período"
            />
            <Stat
              value={data.data.totals.completed_lessons || 0}
              label="Aulas concluídas no período"
            />
            <Stat value={data.data.totals.observations || 0} label="Observações do adulto" />
            <Stat
              value={data.data.totals.completed_trails || 0}
              label="Trilhas concluídas no período"
            />
          </View>
          {data.data && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Action
                secondary
                title="Página anterior de estudantes"
                disabled={!offset}
                onPress={() => setOffset(Math.max(0, offset - data.data!.pagination.limit))}
              />
              <Action
                secondary
                title="Próxima página de estudantes"
                disabled={data.data.pagination.next_offset === null}
                onPress={() => setOffset(data.data!.pagination.next_offset!)}
              />
            </View>
          )}
          <SectionTitle
            title="O que merece um próximo olhar?"
            detail="Pendências de registro, revisão e sinalizações manuais. Sem diagnóstico ou ranking."
          />
          <Copy muted>
            {data.data.detail_scope} Exibindo {data.data.students.length} de{' '}
            {data.data.pagination.total} estudantes.
          </Copy>
          {data.data.students
            .filter((s) => s.attention.length)
            .map((s) => (
              <Card key={s.id}>
                <Copy heading>{s.name}</Copy>
                {s.attention.map((reason, i) => (
                  <View key={i} style={{ gap: 8 }}>
                    <Copy>{reason.reason}</Copy>
                    <Action
                      secondary
                      title={
                        reason.action === 'Assessment'
                          ? 'Registrar avaliação'
                          : reason.action === 'Analysis'
                            ? 'Revisar análise'
                            : 'Abrir acompanhamento e evidências'
                      }
                      onPress={() => navigation.navigate(reason.action, { student: s })}
                    />
                  </View>
                ))}
              </Card>
            ))}
          {!data.data.students.some((s) => s.attention.length) && (
            <Notice text="Sem pendências ou marcações neste filtro. Isso não substitui a observação pedagógica." />
          )}
          <Disclosure title="Habilidades e respostas para investigar">
            <Copy muted>
              Fatos de itens equivalentes: conteúdo, versão, questão e apoios registrados.
              Habilidades vêm do cadastro do autor; não são inferidas por condição do estudante.
            </Copy>
            <EvidenceGroups
              groups={data.data.comparable_groups.filter((g) => g.correct < g.responses)}
            />
            {data.data.observed_support.map((o) => (
              <Card key={o.evidence_id}>
                <Badge text="OBSERVAÇÃO MANUAL" />
                <Copy heading>{o.skill}</Copy>
                <Copy>{o.text}</Copy>
                <Copy muted>
                  {o.support || 'Apoio não descrito'} ·{' '}
                  {new Date(o.date).toLocaleDateString('pt-BR')}
                </Copy>
                {data.data?.students.find((s) => s.id === o.student_id) && (
                  <Action
                    secondary
                    title="Abrir evidências deste estudante"
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
          </Disclosure>
          <SectionTitle title={teacher ? 'Estudantes por situação' : 'Acompanhar cada estudante'} />
          {[
            'unassessed',
            'unconfirmed',
            'pre-silabico',
            'silabico',
            'silabico-sem-valor',
            'silabico-com-valor',
            'silabico-alfabetico',
            'alfabetico',
          ]
            .filter((level) => data.data!.students.some((s) => s.category === level))
            .map((level) => (
              <View key={level} style={{ gap: 12 }}>
                <Badge text={categoryLabel(level)} />
                {data
                  .data!.students.filter((s) => s.category === level)
                  .map((s) => (
                    <Card key={s.id}>
                      <Copy heading>{s.name}</Copy>
                      <Copy>
                        {s.completed_lessons} aulas e {s.completed_tasks} tarefas concluídas no
                        período.
                      </Copy>
                      <Copy muted>
                        Última avaliação:{' '}
                        {s.last_assessment
                          ? new Date(s.last_assessment).toLocaleDateString('pt-BR')
                          : 'ainda não registrada'}
                        . {s.supports.length ? s.supports.length + ' apoios cadastrados.' : ''}
                      </Copy>
                      <MenuRow
                        icon={FileChartColumn}
                        title={'Ver evidências de ' + s.name}
                        detail={
                          teacher
                            ? 'Investigar habilidades, respostas e contexto comparável'
                            : 'Entender registros e próximos passos'
                        }
                        onPress={() =>
                          navigation.navigate('Report', {
                            student: s,
                            classroomId: teacher ? value.classroomId || undefined : undefined,
                          })
                        }
                      />
                      <Action
                        secondary
                        icon={s.next_step === 'assessment' ? ClipboardList : Route}
                        title={
                          s.next_step === 'assessment'
                            ? 'Fazer avaliação inicial'
                            : 'Abrir trilhas do estudante'
                        }
                        onPress={() =>
                          navigation.navigate(
                            s.next_step === 'assessment' ? 'Assessment' : 'Trail',
                            { student: s },
                          )
                        }
                      />
                    </Card>
                  ))}
              </View>
            ))}
          <Notice text={data.data.assessment_freshness.note} />
          {data.data.limitations.map((l) => (
            <Copy muted size="caption" key={l}>
              {l}
            </Copy>
          ))}
        </>
      )}
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
