import { useState } from 'react';
import { View } from 'react-native';
import { FileChartColumn } from 'lucide-react-native';
import { useResource } from '@/shared/data/hooks';
import { useWorkspace } from '@/app/Workspace';
import { Page, Card, Copy, Notice, Action } from '@/shared/ui';
import { Eyebrow, Stat, MenuRow } from '@/shared/ui/learning';
import { LoadState } from '@/shared/ui/ResourceState';
import { TrendChart as TimelineChart } from './TrendChart';
import { PeriodFilter, periodQuery } from './PeriodFilter';
import type { Report, Student } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
import { ExportPDF } from './ExportPDF';
export function CollectiveScreen({ route, navigation }: ScreenProps<'Collective'>) {
  const { value } = useWorkspace();
  const [start, setStart] = useState(value.start);
  const [end, setEnd] = useState(value.end);
  const [offset, setOffset] = useState(0);
  const data = useResource<{
    students: Report[];
    student_profiles: Student[];
    totals: Record<string, number>;
    series: Report['series'];
    note: string;
    pagination: { total: number; next_offset: number | null };
  }>(
    '/classrooms/' +
      route.params.classroomId +
      '/report' +
      (periodQuery(start, end) || '?') +
      '&offset=' +
      offset,
  );
  return (
    <Page>
      <Eyebrow>O OLHAR PARA A TURMA</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Relatório coletivo
      </Copy>
      <Copy>{route.params.title}</Copy>
      <ExportPDF
        path={'/classrooms/' + route.params.classroomId + '/report-pdf'}
        period={periodQuery(start, end)}
      />
      <PeriodFilter
        start={start}
        end={end}
        apply={(s, e) => {
          setStart(s);
          setEnd(e);
          setOffset(0);
        }}
      />
      <LoadState resource={data} />
      {data.data && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Stat value={data.data.totals.students} label="Estudantes autorizados" />
            <Stat value={data.data.totals.completed_tasks} label="Tarefas concluídas" />
            <Stat value={data.data.totals.assessments} label="Avaliações" />
            <Stat value={data.data.totals.observations} label="Observações" />
          </View>
          <TimelineChart series={data.data.series} />
          <Copy muted>
            {data.data.note} Denominador: {data.data.pagination.total} estudantes autorizados desta
            turma.
          </Copy>
          {data.data.students.map((r) => {
            const student = data.data?.student_profiles.find((s) => s.id === r.student_id);
            return (
              <Card key={r.student_id}>
                <Copy heading>{student?.name || 'Estudante autorizado'}</Copy>
                <Copy>
                  {r.completed_tasks} tarefas concluídas · {r.assessments} avaliações ·{' '}
                  {r.observations} observações no período.
                </Copy>
                {student && (
                  <MenuRow
                    icon={FileChartColumn}
                    title="Abrir relatório individual"
                    onPress={() => navigation.navigate('Report', { student })}
                  />
                )}
              </Card>
            );
          })}
          <Action
            secondary
            title="Página anterior de relatórios"
            disabled={!offset}
            onPress={() => setOffset(Math.max(0, offset - 20))}
          />
          <Action
            secondary
            title="Próxima página de relatórios"
            disabled={data.data.pagination.next_offset === null}
            onPress={() => setOffset(data.data!.pagination.next_offset!)}
          />
          {data.data.students.length === 0 && (
            <Notice text="Nenhum estudante autorizado nesta turma. Matrícula isolada não permite acesso." />
          )}
        </>
      )}
    </Page>
  );
}
