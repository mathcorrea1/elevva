import { useState } from 'react';
import { View } from 'react-native';
import {
  BookOpen,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Route,
  HeartHandshake,
} from 'lucide-react-native';
import { Page, Card, Copy, Action, Notice } from '@/shared/ui';
import { Eyebrow, Stat, SectionTitle, Badge, Disclosure, MenuRow } from '@/shared/ui/learning';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { useWorkspace } from '@/app/Workspace';
import { LevelConfirmation } from '@/features/assessments/LevelConfirmation';
import { levelLabel } from '@/features/assessments/levels';
import type { Report } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
import type { Journey } from '@/shared/contracts';
import type { ComparableGroup, EvidenceRow } from './overviewTypes';
import { supportLabel } from './overviewTypes';
import { EvidenceGroups } from './EvidenceGroups';
import { TimelineChart } from './TimelineChart';
import { PeriodFilter, periodQuery } from './PeriodFilter';
import { AnswerReview } from '@/features/lessons/AnswerReview';
export function InvestigationScreen({ route, navigation }: ScreenProps<'Report'>) {
  const { student, classroomId } = route.params;
  const { value, profession } = useWorkspace();
  const [start, setStart] = useState(value.start);
  const [end, setEnd] = useState(value.end);
  const [review, setReview] = useState<EvidenceRow | null>(null);
  const [shown, setShown] = useState(6);
  const [cohortOffset, setCohortOffset] = useState(0);
  const base = periodQuery(start, end);
  const query =
    (base || '?') +
    (classroomId ? (base ? '&' : '') + 'classroom_id=' + encodeURIComponent(classroomId) : '') +
    '&cohort_offset=' +
    cohortOffset;
  const data = useResource<{
    report: Report;
    evidence: EvidenceRow[];
    cohort_groups: ComparableGroup[];
    cohort_students: number;
    cohort_loaded_students: number;
    cohort_next_offset: number | null;
    journey: Journey;
    note: string;
  }>('/students/' + student.id + '/investigation' + query);
  const r = data.data?.report;
  return (
    <Page>
      <Eyebrow>EVIDÊNCIAS PARA APOIAR, SEM ROTULAR</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        A jornada de{'\n'}
        {student.name}
      </Copy>
      <PeriodFilter
        start={start}
        end={end}
        apply={(s, e) => {
          setStart(s);
          setEnd(e);
        }}
      />
      <LoadState resource={data} />
      {classroomId && <Badge text="CONTEXTO DA TURMA AUTORIZADA" />}
      {profession === 'teacher' && !classroomId && value.classroomId && (
        <Action
          secondary
          title="Investigar em relação à turma selecionada"
          onPress={() => navigation.setParams({ classroomId: value.classroomId })}
        />
      )}
      {classroomId && (
        <Action
          secondary
          title="Mostrar somente registros individuais"
          onPress={() => navigation.setParams({ classroomId: undefined })}
        />
      )}
      {r && data.data && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Stat value={r.completed_stages} label="Aulas concluídas" />
            <Stat value={r.completed_tasks} label="Tarefas concluídas" />
            <Stat value={r.completed_trails} label="Trilhas concluídas" />
            <Stat value={r.assessments} label="Avaliações no período" />
            <Stat value={r.observations} label="Observações do adulto" />
          </View>
          <Card>
            <Copy heading>Nível e condições de acompanhamento</Copy>
            <Copy>Nível confirmado: {levelLabel(r.confirmed_level)}</Copy>
            <Copy muted>
              O nível é uma confirmação pedagógica própria. Não aumenta por medalha, nota ou
              conclusão de aula.
            </Copy>
            {student.supports.length ? (
              student.supports.map((s) => <Copy key={s}>Apoio informado: {s}</Copy>)
            ) : (
              <Copy muted>Nenhum apoio informado no cadastro.</Copy>
            )}
            <MenuRow
              icon={HeartHandshake}
              title="Comunicação e apoios do estudante"
              detail="Informações restritas exigem compartilhamento específico"
              onPress={() => navigation.navigate('Care', { student })}
            />
          </Card>
          <TimelineChart series={r.series} />
          <SectionTitle
            title="Quais respostas sustentam esse olhar?"
            detail="Primeira entrega por atribuição, filtrada por período. Outras tentativas continuam no histórico."
          />
          {data.data.evidence.length === 0 && (
            <Notice text="Ainda não há respostas objetivas comparáveis. Você pode consultar observações ou aplicar uma avaliação apropriada." />
          )}
          {data.data.evidence.slice(0, shown).map((e, i) => (
            <Card key={e.evidence_id + e.item_id + i}>
              <Badge text={e.skill} />
              <Copy heading>{e.prompt}</Copy>
              <Copy>
                Resposta registrada: {e.response} ·{' '}
                {e.needs_review
                  ? 'aguarda revisão docente, sem zero automático'
                  : e.correct
                    ? 'acerto neste item'
                    : 'resposta diferente do gabarito'}
              </Copy>
              {e.confirmations != null && (
                <Copy muted size="caption">
                  {e.confirmations} confirmação(ões) preservada(s) neste item. A comparação usa a
                  primeira; resposta mais recente: {e.latest_response}.
                </Copy>
              )}
              <Copy muted>
                {e.title} · v{e.content_version} · {new Date(e.date).toLocaleDateString('pt-BR')}
              </Copy>
              <Copy muted>
                Apoios registrados:{' '}
                {e.supports_used.length
                  ? e.supports_used.map(supportLabel).join(', ')
                  : 'nenhum informado'}
                . Leitura do item {e.reading_allowed ? 'permitida' : 'não permitida'} pelo autor.
              </Copy>
              <Copy size="caption" muted>
                Evidência: {e.evidence_id}
              </Copy>
              {!!e.review && (
                <Copy muted size="caption">
                  Revisão registrada em {new Date(e.review.at).toLocaleString('pt-BR')} ·{' '}
                  {e.review.note}
                </Copy>
              )}
              {e.needs_review && profession === 'teacher' && (
                <Action secondary title="Revisar esta resposta" onPress={() => setReview(e)} />
              )}
            </Card>
          ))}
          {shown < data.data.evidence.length && (
            <Action
              secondary
              title={'Ver mais respostas (' + (data.data.evidence.length - shown) + ')'}
              onPress={() => setShown(shown + 6)}
            />
          )}
          {!!review && (
            <AnswerReview
              studentId={student.id}
              evidence={review}
              close={() => setReview(null)}
              changed={data.reload}
            />
          )}
          {classroomId && (
            <>
              <SectionTitle
                title="O contexto ajuda a investigar"
                detail={
                  'Comparação desta consulta: ' +
                  data.data.cohort_loaded_students +
                  ' de ' +
                  data.data.cohort_students +
                  ' estudantes autorizados, incluindo o estudante em foco. Sem ranking e sem atribuir causa à dificuldade.'
                }
              />
              <EvidenceGroups groups={data.data.cohort_groups} />
              <Action
                secondary
                title="Grupo anterior de comparação"
                disabled={!cohortOffset}
                onPress={() => setCohortOffset(Math.max(0, cohortOffset - 50))}
              />
              <Action
                secondary
                title="Próximo grupo de comparação"
                disabled={data.data.cohort_next_offset === null}
                onPress={() => setCohortOffset(data.data!.cohort_next_offset!)}
              />
              <Copy muted>{data.data.note}</Copy>
            </>
          )}
          <Disclosure title="Avaliações, observações e intervenções">
            {r.events
              .filter((e) => e.kind !== 'attempt')
              .map((e) => (
                <Card key={e.id}>
                  <Copy heading>
                    {e.kind === 'assessment'
                      ? 'Avaliação registrada'
                      : e.kind === 'observation'
                        ? 'Observação pedagógica'
                        : 'Confirmação de nível'}
                  </Copy>
                  <Copy muted>{new Date(e.created_at).toLocaleString('pt-BR')}</Copy>
                  <Copy>{e.context || e.instrument || e.justification || ''}</Copy>
                  {e.text && <Copy>{e.text}</Copy>}
                  {!!e.details?.skill && (
                    <Copy>
                      Habilidade informada: {e.details.skill} · apoio:{' '}
                      {e.details.support || 'não descrito'}
                    </Copy>
                  )}
                  {e.evidence?.map((v, i) => (
                    <Copy key={i}>
                      {v.item}: {v.response}
                    </Copy>
                  ))}
                </Card>
              ))}
          </Disclosure>
          <Disclosure title="Aulas e atividades atribuídas">
            {data.data.journey.stages.map((s) => (
              <Card key={s.id}>
                <Copy heading>{s.title}</Copy>
                <Copy>
                  {s.completed} de {s.total} tarefas concluídas.
                </Copy>
                {s.tasks.map((t) => (
                  <Copy key={t.id}>
                    {t.title}:{' '}
                    {t.completed_at
                      ? 'concluída'
                      : t.locked
                        ? 'ainda não disponível'
                        : 'a realizar ou retomar'}
                  </Copy>
                ))}
              </Card>
            ))}
          </Disclosure>
          <Disclosure title="Confirmar nível com evidências">
            <LevelConfirmation student={student} events={r.events} changed={data.reload} />
          </Disclosure>
          <SectionTitle title="Próximo passo do adulto" />
          <MenuRow
            icon={ClipboardList}
            title="Registrar nova avaliação"
            detail="Mantém o histórico anterior"
            onPress={() => navigation.navigate('Assessment', { student })}
          />
          <MenuRow
            icon={MessageSquare}
            title="Registrar observação ou apoio"
            detail="Descrever fato, contexto e apoio sem inferir diagnóstico"
            onPress={() => navigation.navigate('Observation', { student })}
          />
          <MenuRow
            icon={Route}
            title="Escolher trilha ou atividade pertinente"
            detail="Seleção consciente do adulto"
            onPress={() => navigation.navigate('Trail', { student })}
          />
          <MenuRow
            icon={Sparkles}
            title="Analisar evidências e revisar sugestões"
            detail="Indisponibilidade da IA não interrompe o acompanhamento"
            onPress={() => navigation.navigate('Analysis', { student })}
          />
          <MenuRow
            icon={BookOpen}
            title="Consultar orientações"
            onPress={() => navigation.navigate('Guidance', { student })}
          />
          {r.limitations.map((l) => (
            <Copy muted size="caption" key={l}>
              {l}
            </Copy>
          ))}
        </>
      )}
    </Page>
  );
}
