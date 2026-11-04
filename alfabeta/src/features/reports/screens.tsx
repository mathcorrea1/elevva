import { useState } from 'react';
import { View } from 'react-native';
import { Eyebrow, Stat } from '@/shared/ui/learning';
import { Page, Card, Copy, Notice } from '@/shared/ui';
import type { Report, LearningEvent } from '@/shared/contracts';
import { useResource } from '@/shared/data/hooks';
import type { ScreenProps as Props } from '@/app/routes';
import { LoadState } from '@/shared/ui/ResourceState';
import { LevelConfirmation } from '@/features/assessments/LevelConfirmation';
import { levelLabel } from '@/features/assessments/levels';
import { TimelineChart } from './TimelineChart';
import { PeriodFilter, periodQuery } from './PeriodFilter';
import { History, Sparkles, BookOpen } from 'lucide-react-native';
import { MenuRow, SectionTitle } from '@/shared/ui/learning';

export function HistoryScreen({ route }: Props<'History'>) {
  const result = useResource<LearningEvent[]>('/students/' + route.params.student.id + '/history');
  return (
    <Page>
      <Eyebrow>AS DESCOBERTAS FICAM AQUI</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Cada passo,{'\n'}registrado.
      </Copy>
      <Copy muted>{route.params.student.name}</Copy>
      <LoadState resource={result} />
      {result.data?.length === 0 && <Notice text="Ainda não há registros." />}
      {result.data?.map((e) => (
        <Card key={e.id}>
          <Copy heading>
            {e.kind === 'observation'
              ? 'Observação do adulto'
              : e.kind === 'assessment'
                ? 'Avaliação registrada'
                : e.kind === 'level_confirmation'
                  ? 'Confirmação humana de nível'
                  : 'Execução no aplicativo'}
          </Copy>
          <Copy muted>{new Date(e.finished_at || e.created_at).toLocaleString('pt-BR')}</Copy>
          <Copy>
            {e.kind === 'level_confirmation'
              ? levelLabel(e.level)
              : e.context ||
                e.instrument ||
                (e.status === 'finished' ? 'Execução concluída' : 'Execução em andamento')}
          </Copy>
          {e.justification ? <Copy>{e.justification}</Copy> : null}
          {!!e.text && <Copy>{e.text}</Copy>}
          {e.evidence?.map((v, i) => (
            <Copy key={i}>
              {v.item}: {v.response}
            </Copy>
          ))}
        </Card>
      ))}
    </Page>
  );
}

export function ReportScreen({ route, navigation }: Props<'Report'>) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [query, setQuery] = useState('');
  const result = useResource<Report>('/students/' + route.params.student.id + '/report' + query);
  return (
    <Page>
      <Eyebrow>UM OLHAR SOBRE A JORNADA</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Relatório
      </Copy>
      <Copy muted>{route.params.student.name}</Copy>
      <PeriodFilter
        start={start}
        end={end}
        apply={(s, e) => {
          setStart(s);
          setEnd(e);
          setQuery(periodQuery(s, e));
        }}
      />
      <LoadState resource={result} />
      {!!result.data && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Stat value={result.data.completed_tasks} label="Tarefas concluídas" />
            <Stat value={result.data.finished_attempts} label="Execuções concluídas" />
            <Stat value={result.data.assessments} label="Avaliações registradas" />
            <Stat value={result.data.observations} label="Observações do adulto" />
          </View>
          <TimelineChart series={result.data.series} />
          <Card>
            <Copy heading>Etapas e participação</Copy>
            <Copy>
              {result.data.completed_stages} de {result.data.total_stages} etapas concluídas. As
              atribuídas são do histórico total; as concluídas pertencem ao período.
            </Copy>
          </Card>
          <SectionTitle title="Próximos passos" />
          <MenuRow
            icon={History}
            title="Explorar histórico e avaliações"
            onPress={() => navigation.navigate('History', { student: route.params.student })}
          />
          <MenuRow
            icon={Sparkles}
            title="Análise e recomendações com IA"
            detail="Com revisão humana e identificação da origem"
            onPress={() => navigation.navigate('Analysis', { student: route.params.student })}
          />
          <MenuRow
            icon={BookOpen}
            title="Orientações para acompanhar"
            onPress={() => navigation.navigate('Guidance', { student: route.params.student })}
          />
          <Card>
            <Copy>
              {result.data.assigned_tasks} atribuídas no total · {result.data.finished_attempts}{' '}
              execuções concluídas no período
            </Copy>
            <Copy>
              {result.data.assessments} avaliações · {result.data.observations} observações do
              adulto
            </Copy>
            <Copy>Nível confirmado: {levelLabel(result.data.confirmed_level)}</Copy>
            <LevelConfirmation
              student={route.params.student}
              events={result.data.events}
              changed={result.reload}
            />
            {result.data.comparable_results.map((g, i) => (
              <Copy key={i}>
                {g.title}: {g.correct} respostas corretas entre {g.responses} itens respondidos da
                mesma versão.
              </Copy>
            ))}
            {result.data.limitations.map((v) => (
              <Copy muted key={v}>
                {v}
              </Copy>
            ))}
          </Card>
        </>
      )}
    </Page>
  );
}
