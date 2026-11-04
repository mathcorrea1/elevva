import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, View, Platform } from 'react-native';
import type { ScrollView } from 'react-native';
import { ArrowLeft, ArrowRight, Pause } from 'lucide-react-native';
import { Page, Card, Copy, Action, Notice, Loading } from '@/shared/ui';
import { Badge, Eyebrow } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { IconAction } from '@/shared/ui/IconAction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { repository, operationId } from '@/shared/http/repository';
import { ApiError } from '@/shared/http/errors';
import { useTheme, PresentationScope } from '@/shared/theme/ThemeProvider';
import { useResource } from '@/shared/data/hooks';
import { Reading } from '@/features/accessibility/Reading';
import { Illustration } from '@/features/trails/Illustration';
import type { Care } from '@/features/trails/types';
import type { ScreenProps } from '@/app/routes';
import type { LessonAttempt, ResponseValue, LessonScreenData } from './types';
import { responseReady, emptyValue } from './types';
import { Activity } from './Activity';
import { YouTube } from './YouTube';

export function ContentScreen({ screen }: { screen: LessonScreenData }) {
  return (
    <View style={{ gap: 18 }}>
      {screen.image && <Illustration image={screen.image} height={210} />}
      {!!screen.text && <Copy>{screen.text}</Copy>}
      {!!screen.instruction && <Copy muted>{screen.instruction}</Copy>}
      {!!screen.text && <Reading text={screen.text} />}
      {!!screen.video_id && <YouTube id={screen.video_id} transcript={screen.transcript} />}
    </View>
  );
}

function Player({ route, navigation }: ScreenProps<'LessonPlayer'>) {
  const { student, assignment, retry } = route.params;
  const { colors, preferences } = useTheme();
  const insets = useSafeAreaInsets();
  const [attempt, setAttempt] = useState<LessonAttempt | null>(null);
  const state = useRef<LessonAttempt | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [value, setValue] = useState<ResponseValue>(null);
  const [pause, setPause] = useState(false);
  const [hint, setHint] = useState(false);
  const [conflict, setConflict] = useState(false);
  const conflictRef = useRef(false);
  const [accessLost, setAccessLost] = useState(false);
  const lost = useRef(false);
  const scroll = useRef<ScrollView | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draft = useRef<{ item_id: string; value: ResponseValue } | null>(null);
  const pending = useRef<{ path: string; body: object; key: string } | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const allowExit = useRef(false);
  const alive = useRef(true);
  const startKey = useRef(operationId());
  const actionLock = useRef(false);
  const spoken = useRef(false);
  function perform(action: () => Promise<void>) {
    if (actionLock.current) return Promise.resolve();
    actionLock.current = true;
    return action().finally(() => {
      actionLock.current = false;
    });
  }
  const prefix = '/students/' + student.id;
  const accept = useCallback((a: LessonAttempt) => {
    if (lost.current) return;
    const merged = state.current?.id === a.id ? { ...state.current, ...a } : a;
    state.current = merged;
    if (alive.current) setAttempt(merged);
  }, []);
  function handleError(e: unknown) {
    if (!alive.current) return;
    setError((e as Error).message);
    if (e instanceof ApiError && e.status === 409 && state.current) {
      conflictRef.current = true;
      setConflict(true);
    }
    if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
      lost.current = true;
      pending.current = null;
      draft.current = null;
      state.current = null;
      allowExit.current = true;
      setAttempt(null);
      setValue(null);
      setDirty(false);
      setAccessLost(true);
    }
  }
  async function useSavedProgress() {
    if (!state.current || busy) return;
    setBusy(true);
    try {
      await queue.current.catch(() => undefined);
      const fresh = await repository.get<LessonAttempt>(prefix + '/attempts/' + state.current.id);
      pending.current = null;
      draft.current = null;
      conflictRef.current = false;
      setConflict(false);
      setDirty(false);
      setError('');
      accept(fresh);
      const q = fresh.items.find((i) => i.id === fresh.screens[fresh.cursor]?.item_id);
      setValue(q ? (fresh.drafts[q.id] ?? fresh.responses[q.id] ?? emptyValue(q.kind)) : null);
      spoken.current = false;
    } catch (e) {
      handleError(e);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function load() {
    setError('');
    try {
      const a = await repository.command<LessonAttempt>(
        prefix + '/assignments/' + assignment.id + (retry ? '/retry' : '/start'),
        {},
        startKey.current,
      );
      accept(a);
      const q = a.items.find((i) => i.id === a.screens[a.cursor]?.item_id);
      if (q) setValue(a.drafts[q.id] ?? a.responses[q.id] ?? emptyValue(q.kind));
    } catch (e) {
      handleError(e);
    }
  }
  useEffect(() => {
    alive.current = true;
    void load();
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  async function settle() {
    if (conflictRef.current)
      throw new ApiError(
        409,
        'O acompanhamento foi atualizado em outro acesso. Confira o progresso salvo antes de continuar.',
      );
    const p = pending.current;
    if (!p) return;
    const a = await repository.command<LessonAttempt>(p.path, p.body, p.key);
    if (
      p.path.endsWith('/draft') &&
      draft.current &&
      draft.current.item_id === (p.body as any).item_id &&
      JSON.stringify(draft.current.value) === JSON.stringify((p.body as any).value)
    ) {
      draft.current = null;
      if (alive.current) setDirty(false);
    }
    pending.current = null;
    accept(a);
  }
  async function write(suffix: string, body: object) {
    await settle();
    const a = state.current;
    if (!a) throw new Error('Aguarde o carregamento da aula.');
    pending.current = {
      path: prefix + '/attempts/' + a.id + suffix,
      body: { ...body, version: a.version },
      key: operationId(),
    };
    await settle();
  }
  function enqueue(action: () => Promise<void>) {
    const next = queue.current
      .catch(() => undefined)
      .then(async () => {
        if (alive.current) {
          setBusy(true);
          setError('');
        }
        try {
          await action();
        } catch (e) {
          handleError(e);
          throw e;
        } finally {
          if (alive.current) setBusy(false);
        }
      });
    queue.current = next;
    return next;
  }
  async function flush() {
    if (timer.current) clearTimeout(timer.current);
    await settle();
    const d = draft.current;
    if (d) {
      await write('/draft', d);
      if (draft.current === d) {
        draft.current = null;
        if (alive.current) setDirty(false);
      }
    }
  }
  function change(v: ResponseValue) {
    const a = state.current;
    const id = a?.screens[a.cursor]?.item_id;
    if (!id) return;
    setValue(v);
    setDirty(true);
    draft.current = { item_id: id, value: v };
    if (timer.current) clearTimeout(timer.current);
    if (!conflictRef.current)
      timer.current = setTimeout(() => {
        void enqueue(flush).catch(() => undefined);
      }, 450);
  }
  async function leave(action: () => void) {
    await enqueue(flush);
    allowExit.current = true;
    action();
  }
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (allowExit.current || state.current?.status === 'finished' || !state.current) return;
        e.preventDefault();
        void leave(() => navigation.dispatch(e.data.action)).catch(() => undefined);
      }),
    [navigation],
  );
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      setPause(true);
      return true;
    });
    const bg = AppState.addEventListener('change', (status) => {
      if (status !== 'active' && state.current?.status === 'in_progress')
        void enqueue(flush).catch(() => undefined);
    });
    const unload = (e: BeforeUnloadEvent) => {
      if (draft.current || pending.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined')
      window.addEventListener('beforeunload', unload);
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => (
        <Action secondary quiet title="Pausar aula" onPress={() => setPause(true)} />
      ),
    });
    return () => {
      back.remove();
      bg.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined')
        window.removeEventListener('beforeunload', unload);
    };
  }, [navigation]);
  if (accessLost)
    return (
      <Page>
        <Notice text="O acesso a este acompanhamento mudou. Volte à lista para atualizar seus vínculos." />
        <Action title="Voltar à lista" onPress={() => navigation.goBack()} />
      </Page>
    );
  if (!attempt)
    return (
      <Page>
        {error ? (
          <>
            <Notice error text={error} />
            <Action title="Tentar abrir novamente" onPress={() => void load()} />
          </>
        ) : (
          <Loading />
        )}
      </Page>
    );
  const screen = attempt.screens[attempt.cursor];
  const q = attempt.items.find((i) => i.id === screen?.item_id);
  const feedback = q ? attempt.item_results[q.id] : undefined;
  const previousAnswers = q
    ? (attempt.interaction_counts?.[q.id] ??
      attempt.interactions.filter((e) => e.kind === 'answer' && e.item_id === q.id).length)
    : 0;
  const exhausted =
    !!q && !!previousAnswers && (!q.allow_retry || previousAnswers >= (q.max_attempts ?? 100));
  async function move(delta: number) {
    await perform(() =>
      enqueue(async () => {
        await flush();
        const a = state.current!;
        await write('/progress', { cursor: a.cursor + delta, acknowledge_screen: screen.id });
        const next = state.current!;
        const item = next.items.find((i) => i.id === next.screens[next.cursor]?.item_id);
        setValue(
          item ? (next.drafts[item.id] ?? next.responses[item.id] ?? emptyValue(item.kind)) : null,
        );
        setHint(false);
        spoken.current = false;
        scroll.current?.scrollTo({ y: 0, animated: false });
      }),
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, gap: 8, borderBottomWidth: 1, borderColor: colors.divider }}>
        <Copy muted size="caption">
          {attempt.lesson_title} · {student.name}
        </Copy>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Posição atual na aula"
          accessibilityValue={{
            min: 0,
            max: attempt.screens.length,
            now: attempt.cursor + 1,
            text: 'Tela ' + (attempt.cursor + 1) + ' de ' + attempt.screens.length,
          }}
          style={{ height: 8, backgroundColor: colors.divider, borderRadius: 8 }}
        >
          <View
            style={{
              height: 8,
              width: `${((attempt.cursor + 1) / attempt.screens.length) * 100}%`,
              backgroundColor: colors.primary,
              borderRadius: 8,
            }}
          />
        </View>
        <Copy muted size="caption">
          Tela {attempt.cursor + 1} de {attempt.screens.length} ·{' '}
          {dirty ? 'Salvamento pendente' : busy ? 'Salvando…' : 'Progresso salvo'}
        </Copy>
      </View>
      <Page scrollRef={scroll}>
        {!!error && (
          <>
            <Notice error text={error + ' Suas alterações continuam nesta tela.'} />
            {conflict ? (
              <>
                <Copy>
                  Uma versão mais recente foi salva em outro acesso. Usar esse progresso substitui
                  as seleções ainda pendentes desta tela. Você poderá conferir a resposta antes de
                  tentar novamente.
                </Copy>
                <Action
                  secondary
                  title="Usar progresso salvo no servidor"
                  disabled={busy}
                  onPress={() => void useSavedProgress()}
                />
              </>
            ) : (
              <Action
                secondary
                title="Tentar salvar novamente"
                onPress={() => void enqueue(flush).catch(() => undefined)}
              />
            )}
          </>
        )}
        {attempt.status === 'finished' ? (
          <Card>
            <Illustration image={{ builtin: 'lumi', alt: '' }} height={160} />
            <Copy heading headingLevel={1}>
              Mais uma descoberta!
            </Copy>
            <Copy>
              {!attempt.result.total_items
                ? 'Aula de conteúdo concluída. As telas percorridas foram salvas.'
                : !attempt.result.valid_items
                  ? attempt.result.pending_review
                    ? 'Entrega salva. A correção aguarda revisão docente.'
                    : 'Entrega salva. Nenhum item corrigível foi respondido.'
                  : 'Entrega salva. ' +
                    attempt.result.correct +
                    ' acertos em ' +
                    attempt.result.valid_items +
                    ' itens corrigíveis.'}
            </Copy>
            {!!attempt.result.pending_review && (
              <Copy>
                {attempt.result.pending_review} resposta(s) ficaram salvas para olhar com o
                professor.
              </Copy>
            )}
            <Copy muted>Cada descoberta tem seu tempo. Vamos continuar no seu ritmo.</Copy>
            <Action
              title="Voltar às minhas aulas"
              onPress={() => {
                allowExit.current = true;
                navigation.goBack();
              }}
            />
          </Card>
        ) : (
          <>
            <Eyebrow>
              {screen.type === 'activity'
                ? 'HORA DE EXPERIMENTAR'
                : screen.type === 'completion'
                  ? 'UM PASSO DE CADA VEZ'
                  : 'VAMOS DESCOBRIR'}
            </Eyebrow>
            <Copy heading headingLevel={1} size="display">
              {screen.title || (screen.type === 'activity' ? q?.prompt : 'Nossa descoberta')}
            </Copy>
            <ContentScreen screen={screen} />
            {q && (
              <>
                <Copy heading>{screen.title ? q.prompt : ''}</Copy>
                {q.image && <Illustration image={q.image} height={180} />}
                {!!q.instruction && <Copy>{q.instruction}</Copy>}
                {q.reading_allowed && (
                  <Reading
                    text={[q.prompt, q.instruction].filter(Boolean).join('. ')}
                    onSpoken={() => {
                      spoken.current = true;
                    }}
                  />
                )}
                <Activity
                  key={q.id}
                  question={q}
                  value={value}
                  onChange={change}
                  disabled={exhausted || conflict}
                />
                {!!q.hint && (
                  <>
                    <Action
                      secondary
                      quiet
                      title={hint ? 'Ocultar dica' : 'Preciso de uma dica'}
                      onPress={() => setHint(!hint)}
                    />
                    {hint && <Notice text={q.hint} />}
                  </>
                )}
                {feedback && (
                  <Notice
                    text={
                      (feedback.needs_review
                        ? 'Aguardando revisão. '
                        : feedback.correct
                          ? 'Resposta correta. '
                          : 'Vamos continuar aprendendo. ') + feedback.feedback
                    }
                  />
                )}
                {exhausted && (
                  <Copy muted>
                    Respostas desta questão já foram registradas conforme as tentativas definidas
                    pelo professor.
                  </Copy>
                )}
                {!q.required && <Badge text="Questão opcional" />}
                {!q.required &&
                  !(q.id in attempt.responses) &&
                  attempt.cursor < attempt.screens.length - 1 && (
                    <Action
                      secondary
                      quiet
                      title="Pular questão opcional"
                      disabled={busy || conflict}
                      onPress={() => void move(1).catch(() => undefined)}
                    />
                  )}
              </>
            )}
            <Action
              secondary
              quiet
              icon={Pause}
              title="Pausar e continuar depois"
              disabled={busy}
              onPress={() => setPause(true)}
            />
          </>
        )}
      </Page>
      {attempt.status !== 'finished' && (
        <View
          style={{
            padding: 12,
            paddingBottom: Math.max(12, insets.bottom),
            borderTopWidth: 1,
            borderColor: colors.divider,
            backgroundColor: colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <IconAction
            icon={ArrowLeft}
            label="Tela anterior"
            disabled={busy || conflict || !attempt.cursor}
            onPress={() => void move(-1).catch(() => undefined)}
          />
          <View style={{ flex: 1 }}>
            {q &&
            !exhausted &&
            (!(q.id in attempt.responses) || q.id in attempt.drafts || dirty) ? (
              <Action
                title={previousAnswers ? 'Confirmar nova tentativa' : 'Confirmar resposta'}
                disabled={busy || conflict || !responseReady(q, value)}
                onPress={() =>
                  void perform(() =>
                    enqueue(async () => {
                      await flush();
                      await write('/responses', {
                        item_id: q.id,
                        value,
                        supports_used: [
                          ...(spoken.current ? ['instruction_audio'] : []),
                          ...(preferences.font_scale > 1 ? ['large_text'] : []),
                          ...(preferences.contrast ? ['high_contrast'] : []),
                        ],
                      });
                      spoken.current = false;
                    }),
                  ).catch(() => undefined)
                }
              />
            ) : attempt.cursor < attempt.screens.length - 1 ? (
              <Action
                icon={ArrowRight}
                title="Próxima tela"
                disabled={busy || conflict || (!!q && q.required && !(q.id in attempt.responses))}
                onPress={() => void move(1).catch(() => undefined)}
              />
            ) : (
              <Action
                title="Entregar e concluir aula"
                disabled={
                  busy ||
                  conflict ||
                  attempt.items.some((i) => i.required && !(i.id in attempt.responses))
                }
                onPress={() =>
                  void perform(() =>
                    enqueue(async () => {
                      await flush();
                      await write('/progress', {
                        cursor: attempt.cursor,
                        acknowledge_screen: screen.id,
                      });
                      await write('/finish', {});
                    }),
                  ).catch(() => undefined)
                }
              />
            )}
          </View>
        </View>
      )}
      <Sheet visible={pause} title="Vamos continuar depois?" close={() => setPause(false)}>
        <Copy>
          As respostas confirmadas e o rascunho atual serão salvos. A aula continua deste ponto
          quando você voltar.
        </Copy>
        {!!error && <Notice error text={error} />}
        {conflict && (
          <Action
            secondary
            title="Usar progresso salvo no servidor"
            disabled={busy}
            onPress={() => void useSavedProgress()}
          />
        )}
        <Action
          title="Salvar e sair da aula"
          disabled={busy || conflict}
          onPress={() => void leave(() => navigation.goBack()).catch(() => undefined)}
        />
        <Action secondary title="Continuar aqui" onPress={() => setPause(false)} />
      </Sheet>
    </View>
  );
}
export function PlayerScreen(props: ScreenProps<'LessonPlayer'>) {
  const care = useResource<Care>('/students/' + props.route.params.student.id + '/care');
  return (
    <PresentationScope fontScale={care.data?.presentation.font_scale || 1}>
      <Player {...props} />
    </PresentationScope>
  );
}
