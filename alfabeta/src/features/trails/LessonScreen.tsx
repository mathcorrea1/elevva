import { useState } from 'react';
import { Page, Card, Copy, Action, Notice } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Eyebrow, Badge } from '@/shared/ui/learning';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { Reading } from '@/features/accessibility/Reading';
import { QuickAccessibility } from '@/features/accessibility/QuickAccessibility';
import type { ScreenProps } from '@/app/routes';
import { Illustration } from './Illustration';
import { lessonStates } from './MapScreen';
import type { TrailMap, Care } from './types';
export function LessonScreen({ route, navigation }: ScreenProps<'Lesson'>) {
  const { student, enrollmentId, lessonId } = route.params;
  const data = useResource<TrailMap>('/students/' + student.id + '/trails/' + enrollmentId);
  const care = useResource<Care>('/students/' + student.id + '/care');
  const [instructions, setInstructions] = useState(false);
  const stage = data.data?.journey.stages.find((s) => s.id === lessonId);
  const task = stage?.tasks.find((t) => !t.completed_at);
  const text =
    care.data?.presentation.instruction_mode === 'concise' && stage?.lesson.concise_instructions
      ? stage.lesson.concise_instructions
      : stage?.lesson.instructions || stage?.tasks[0]?.instructions || '';
  return (
    <Page>
      <LoadState resource={data} />
      {stage ? (
        <>
          <Eyebrow>UMA AULA, MUITAS DESCOBERTAS</Eyebrow>
          <Illustration image={stage.lesson.image} height={190} />
          <Copy heading headingLevel={1} size="display">
            {stage.title}
          </Copy>
          <Badge text={lessonStates[stage.state]} />
          <Copy>{stage.description}</Copy>
          <Copy muted>
            {stage.tasks.reduce((n, t) => n + t.item_count, 0)} questões · {stage.total} atividades
            em sequência
          </Copy>
          <Action secondary title="Ver instruções e apoios" onPress={() => setInstructions(true)} />
          <QuickAccessibility />
          {data.data?.journey.assessment_required && (
            <Card>
              <Copy>Antes da primeira aula, registre a avaliação inicial.</Copy>
              <Action
                title="Registrar avaliação"
                onPress={() => navigation.navigate('Assessment', { student })}
              />
            </Card>
          )}
          {task && (
            <>
              <Action
                title={
                  task.latest_result && !task.latest_result.passed
                    ? task.latest_result.pending_review
                      ? 'Aguardando revisão docente'
                      : 'Nova tentativa'
                    : task.state === 'in_progress'
                      ? 'Continuar aula'
                      : 'Iniciar aula'
                }
                disabled={
                  task.locked ||
                  (!!task.latest_result?.pending_review && !task.latest_result.passed)
                }
                onPress={() =>
                  task.runner === 'screens'
                    ? navigation.navigate('LessonPlayer', {
                        student,
                        assignment: task,
                        retry: !!task.latest_result && !task.latest_result.passed,
                      })
                    : navigation.navigate('Execute', {
                        student,
                        assignment: task,
                        enrollmentId,
                        lessonId,
                        retry: !!task.latest_result && !task.latest_result.passed,
                      })
                }
              />
              {task.block_reason && <Notice text={task.block_reason} />}
            </>
          )}
          {stage.tasks.map((t) => (
            <Card key={t.id}>
              <Copy heading>{t.title}</Copy>
              <Copy>
                {t.completed_at
                  ? 'Concluída e salva'
                  : t.state === 'locked'
                    ? 'Conclua a anterior'
                    : t.state === 'in_progress'
                      ? 'Respostas em andamento'
                      : 'Disponível'}
              </Copy>
              {t.latest_result && (
                <>
                  <Copy>
                    {t.latest_result.valid_items
                      ? `${t.latest_result.correct} acertos em ${t.latest_result.valid_items} itens respondidos e corrigíveis.`
                      : t.latest_result.pending_review
                        ? 'Correção aguardando revisão docente.'
                        : 'Nenhum item corrigível respondido.'}
                  </Copy>
                  <Copy muted>
                    {t.latest_result.required_answered} de {t.latest_result.required_items} questões
                    obrigatórias entregues · {t.attempt_count} tentativa(s) preservada(s).
                  </Copy>
                  {t.latest_result.advance_percent !== null && (
                    <Copy>
                      Critério explícito para avançar: {t.latest_result.advance_percent}% nas
                      questões obrigatórias desta atividade.
                    </Copy>
                  )}
                </>
              )}
            </Card>
          ))}
          {stage.state === 'completed' && (
            <>
              <Notice text="Aula concluída! Suas respostas e conquistas estão salvas." />
              <Action title="Escolher próxima aula no mapa" onPress={() => navigation.goBack()} />
            </>
          )}
          <Sheet
            visible={instructions}
            title="Como vamos descobrir?"
            close={() => setInstructions(false)}
          >
            <Copy>{text}</Copy>
            <Reading text={text} />
            <Copy muted>
              A instrução curta é usada quando cadastrada para o estudante e disponível no conteúdo.
              A leitura da questão só aparece quando permitida. Vídeo revisado em Libras ainda não
              disponível.
            </Copy>
          </Sheet>
        </>
      ) : (
        !data.loading && <Notice text="Aula indisponível para este estudante e versão da trilha." />
      )}
    </Page>
  );
}
