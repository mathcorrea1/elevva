import { Page, Card, Copy, Action, Notice } from '@/shared/ui';
import { Eyebrow, Badge } from '@/shared/ui/learning';
import { usePaged } from '@/shared/data/paged';
import { Illustration } from '@/features/trails/Illustration';
import { useWorkspace } from '@/app/Workspace';
import type { ScreenProps } from '@/app/routes';
import type { Assignment } from '@/shared/contracts';
import type { ImageRef } from '@/features/trails/types';
import type { ObjectiveResult } from '@/features/trails/types';
export function AssignedScreen({ route, navigation }: ScreenProps<'AssignedLessons'>) {
  const student = route.params.student;
  const { profession } = useWorkspace();
  const data = usePaged<
    Assignment & {
      cover: ImageRef | null;
      version: number;
      block_reason: string | null;
      latest_result: ObjectiveResult | null;
    }
  >('/students/' + student.id + '/lesson-assignments');
  return (
    <Page>
      <Eyebrow>UMA DESCOBERTA POR VEZ</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Aulas de {student.name}
      </Copy>
      {profession === 'teacher' && (
        <Action
          secondary
          title="Atribuir aula da biblioteca"
          onPress={() => navigation.navigate('LessonLibrary', { studentId: student.id })}
        />
      )}
      {data.loading && <Copy>Buscando aulas salvas…</Copy>}
      {!!data.error && <Notice error text={data.error} />}
      {data.items.map((a) => (
        <Card key={a.id}>
          <Illustration image={a.cover || { builtin: 'sprout', alt: '' }} height={150} />
          <Copy heading>{a.title}</Copy>
          <Badge text={a.completed_at ? 'ENTREGA SALVA' : 'SUA PRÓXIMA DESCOBERTA'} />
          <Copy muted>Versão {a.version}. Seu progresso fica salvo nesta atribuição.</Copy>
          {!a.completed_at && (
            <Action
              title={
                a.latest_result && !a.latest_result.passed
                  ? a.latest_result.pending_review
                    ? 'Aguardando revisão docente'
                    : 'Nova tentativa'
                  : 'Abrir ou continuar aula'
              }
              disabled={a.locked || (!!a.latest_result?.pending_review && !a.latest_result.passed)}
              onPress={() =>
                navigation.navigate('LessonPlayer', {
                  student,
                  assignment: a,
                  retry: !!a.latest_result && !a.latest_result.passed,
                })
              }
            />
          )}
          {!!a.block_reason && <Notice text={a.block_reason} />}
          {a.completed_at && (
            <Action
              secondary
              title="Ver resultados no relatório"
              onPress={() => navigation.navigate('Report', { student })}
            />
          )}
        </Card>
      ))}
      {data.next !== null && (
        <Action
          secondary
          title="Carregar mais aulas"
          disabled={data.loading}
          onPress={() => void data.more()}
        />
      )}
      {!data.loading && !data.items.length && (
        <Notice text="Nenhuma aula atribuída ainda. As trilhas e atividades anteriores continuam disponíveis." />
      )}
    </Page>
  );
}
