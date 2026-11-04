import { useEffect, useState } from 'react';
import { View, Image, BackHandler } from 'react-native';
import { ArrowLeft, ArrowRight, Pause, Check } from 'lucide-react-native';
import { Page, Card, Copy, Action, Notice } from '@/shared/ui';
import { Eyebrow, Badge } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { celebration } from '@/assets/journey';
import { useResource, useCommand } from '@/shared/data/hooks';
import { SaveState, LoadState } from '@/shared/ui/ResourceState';
import { PresentationScope, useTheme } from '@/shared/theme/ThemeProvider';
import { Reading } from '@/features/accessibility/Reading';
import { QuickAccessibility } from '@/features/accessibility/QuickAccessibility';
import type { ScreenProps } from '@/app/routes';
import type { Attempt } from '@/shared/contracts';
import type { ObjectiveResult, Care } from '@/features/trails/types';
export function ExecuteScreen(props: ScreenProps<'Execute'>) {
  const care = useResource<Care>('/students/' + props.route.params.student.id + '/care');
  return (
    <PresentationScope fontScale={care.data?.presentation.font_scale}>
      <Executor {...props} />
    </PresentationScope>
  );
}
function Executor({ route, navigation }: ScreenProps<'Execute'>) {
  const { student, assignment, enrollmentId, lessonId, retry } = route.params;
  const { preferences } = useTheme();
  const save = useCommand();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [instructions, setInstructions] = useState(false);
  const [pause, setPause] = useState(false);
  const [result, setResult] = useState<ObjectiveResult | null>(null);
  const [feedback, setFeedback] = useState<{
    stage_completed: boolean;
    stage_title: string;
    new_achievements: { id: string; title: string; description: string }[];
  } | null>(null);
  const [audio, setAudio] = useState(false);
  async function start() {
    await save.run<Attempt>(
      '/students/' + student.id + '/assignments/' + assignment.id + (retry ? '/retry' : '/start'),
      {},
      (a) => {
        setAttempt(a);
        const next = a.items.findIndex((i) => !(i.id in a.responses));
        setIndex(next < 0 ? a.items.length : next);
      },
    );
  }
  useEffect(() => {
    void start();
  }, [assignment.id]);
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => <Action secondary quiet title="Voltar" onPress={() => setPause(true)} />,
    });
  }, [navigation]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPause(true);
      return true;
    });
    return () => sub.remove();
  }, []);
  const item = attempt?.items[index];
  const choice = item ? (drafts[item.id] ?? attempt?.responses[item.id] ?? null) : null;
  const pending = !!item && choice !== null && choice !== attempt?.responses[item.id];
  const requiredRemaining =
    attempt?.items.filter((i) => i.required !== false && !(i.id in attempt.responses)).length || 0;
  async function confirm(after?: () => void) {
    if (!attempt || !item || choice === null) return;
    const supports_used = [
      ...(audio ? ['instruction_audio'] : []),
      ...(preferences.font_scale > 1 ? ['large_text'] : []),
      ...(preferences.contrast ? ['high_contrast'] : []),
    ];
    await save.run<Attempt>(
      '/students/' + student.id + '/attempts/' + attempt.id + '/responses',
      { version: attempt.version, item_id: item.id, choice, supports_used },
      (a) => {
        setAttempt({ ...attempt, ...a });
        setDrafts((previous) => {
          const next = { ...previous };
          delete next[item.id];
          return next;
        });
        if (after) after();
        else setIndex(Math.min(index + 1, attempt.items.length));
      },
    );
  }
  function leave() {
    setPause(false);
    navigation.goBack();
  }
  return (
    <Page>
      {!result && (
        <>
          <Action secondary icon={Pause} title="Pausar aula" onPress={() => setPause(true)} />
          <QuickAccessibility />
        </>
      )}
      {result ? (
        <>
          <Image
            source={celebration}
            accessible={false}
            resizeMode="contain"
            style={{ width: 180, height: 190, alignSelf: 'center' }}
          />
          <Eyebrow>ENTREGA SALVA</Eyebrow>
          <Copy heading headingLevel={1} size="display">
            {result.passed ? 'Mais uma descoberta!' : 'Vamos olhar de novo?'}
          </Copy>
          <Card>
            <Copy heading>
              {result.correct} acertos em {result.valid_items} itens respondidos e corrigíveis
            </Copy>
            <Copy>
              {result.required_answered} de {result.required_items} questões obrigatórias entregues.
            </Copy>
            {result.advance_percent !== null && (
              <Copy>
                Critério configurado para avançar: {result.advance_percent}% de acertos entre as
                obrigatórias.
              </Copy>
            )}
            <Copy muted>{result.note}</Copy>
          </Card>
          {feedback?.stage_completed && (
            <Notice
              text={'Aula ' + feedback.stage_title + ' concluída! O próximo passo está no mapa.'}
            />
          )}
          {feedback?.new_achievements.map((a) => (
            <Notice key={a.id} text={a.title + ': ' + a.description} />
          ))}
          {!result.passed && (
            <Notice text="A tentativa foi preservada. Use Nova tentativa na aula para responder novamente; suas respostas entregues não serão sobrescritas." />
          )}
          <Action
            title={enrollmentId ? 'Voltar à aula e continuar' : 'Voltar às atividades'}
            onPress={() => {
              if (enrollmentId && lessonId)
                navigation.replace('Lesson', { student, enrollmentId, lessonId });
              else navigation.goBack();
            }}
          />
        </>
      ) : !attempt ? (
        <>
          <LoadState resource={{ loading: save.busy, error: save.error, reload: start }} />
          {!save.busy && (
            <Action title="Retomar carregamento da atividade" onPress={() => void start()} />
          )}
        </>
      ) : item ? (
        <>
          <Badge text={'QUESTÃO ' + (index + 1) + ' DE ' + attempt.items.length} />
          <Copy heading headingLevel={1} size="display">
            {item.prompt}
          </Copy>
          {item.required === false && <Badge text="QUESTÃO OPCIONAL" />}
          <Action secondary title="Ver instruções" onPress={() => setInstructions(true)} />
          <Reading
            text={item.prompt}
            allowed={item.reading_allowed}
            onSpoken={() => setAudio(true)}
          />
          {item.choices.map((option, i) => (
            <Action
              key={i}
              secondary
              selected={choice === i}
              title={String.fromCharCode(65 + i) + '. ' + option}
              disabled={save.busy}
              onPress={() => setDrafts({ ...drafts, [item.id]: i })}
            />
          ))}
          <Action
            icon={Check}
            title={pending ? 'Confirmar e salvar resposta' : 'Resposta salva · continuar'}
            disabled={choice === null || save.busy}
            onPress={() => {
              if (pending) void confirm();
              else setIndex(Math.min(index + 1, attempt.items.length));
            }}
          />
          {pending && (
            <Notice text="Seleção ainda não salva. Confirme antes de mudar de questão ou use Pausar." />
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Action
              secondary
              icon={ArrowLeft}
              title="Questão anterior"
              disabled={index === 0 || pending || save.busy}
              onPress={() => setIndex(index - 1)}
            />
            <Action
              secondary
              icon={ArrowRight}
              title={
                item.required === false && choice === null ? 'Pular opcional' : 'Próxima questão'
              }
              disabled={pending || save.busy || (choice === null && item.required !== false)}
              onPress={() => setIndex(index + 1)}
            />
          </View>
          {!requiredRemaining && !pending && (
            <Action
              secondary
              title="Revisar entrega"
              onPress={() => setIndex(attempt.items.length)}
            />
          )}
        </>
      ) : (
        <>
          <Copy heading headingLevel={1} size="display">
            Vamos conferir?
          </Copy>
          <Copy muted>
            Você pode rever as respostas antes de entregar. Depois da entrega, a tentativa fica
            preservada.
          </Copy>
          {attempt.items.map((q, i) => (
            <Card key={q.id}>
              <Copy>
                {i + 1}. {q.prompt}
              </Copy>
              <Copy>
                {q.id in attempt.responses
                  ? 'Resposta salva: ' + q.choices[attempt.responses[q.id]]
                  : q.required === false
                    ? 'Opcional não respondida'
                    : 'Obrigatória pendente'}
              </Copy>
              <Action secondary title={'Rever questão ' + (i + 1)} onPress={() => setIndex(i)} />
            </Card>
          ))}
          <Action
            title="Entregar atividade"
            disabled={requiredRemaining > 0 || save.busy}
            onPress={() =>
              void save.run<{ result: ObjectiveResult; feedback: NonNullable<typeof feedback> }>(
                '/students/' + student.id + '/attempts/' + attempt.id + '/finish',
                { version: attempt.version },
                (data) => {
                  setResult(data.result);
                  setFeedback(data.feedback);
                },
              )
            }
          />
        </>
      )}
      <SaveState command={save} />
      <Sheet visible={instructions} title="Como responder" close={() => setInstructions(false)}>
        <Copy>{attempt?.instructions}</Copy>
        <Reading text={attempt?.instructions || ''} onSpoken={() => setAudio(true)} />
        <Copy muted>
          Confirme para salvar. Você pode editar antes da entrega. Libras: vídeo revisado ainda não
          disponível.
        </Copy>
      </Sheet>
      <Sheet visible={pause} title="Pausar esta aula?" close={() => setPause(false)}>
        <Copy>As respostas já confirmadas ficam salvas e serão recuperadas ao retomar.</Copy>
        {pending ? (
          <>
            <Notice text="Sua seleção atual ainda não foi enviada." />
            <Action
              title="Salvar seleção e pausar"
              disabled={save.busy}
              onPress={() => void confirm(leave)}
            />
            <Action secondary title="Descartar seleção atual e pausar" onPress={leave} />
          </>
        ) : (
          <Action title="Pausar com respostas salvas" onPress={leave} />
        )}
        <Action secondary title="Continuar respondendo" onPress={() => setPause(false)} />
        <SaveState command={save} />
      </Sheet>
    </Page>
  );
}
