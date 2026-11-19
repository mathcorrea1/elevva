import { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import type { ScrollView } from 'react-native';
import { Sparkles, Eye, Pencil, RotateCcw } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { Badge, Eyebrow, Pills, SectionTitle, MenuRow } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useResource, useCommand } from '@/shared/data/hooks';
import { repository } from '@/shared/http/repository';
import { literacyOptions, levelLabel } from '@/features/assessments/levels';
import type { ScreenProps } from '@/app/routes';
import { PreviewSheet } from './PreviewSheet';
import type { Lesson, LessonBody, Mechanic } from './types';
import { mechanics } from './types';

type Generation = {
  id: string;
  status: string;
  origin: string;
  model: string;
  created_at: string;
  content_id: string | null;
  request_id: string | null;
  result?: { lesson: LessonBody & { title: string }; warnings: string[] } | null;
};
export const generationStatus: Record<string, string> = {
  pending: 'Em processamento',
  completed: 'Proposta pronta',
  timeout: 'Tempo esgotado',
  quota: 'Cota do provedor atingida',
  refused: 'Pedido não atendido',
  truncated: 'Resposta incompleta',
  invalid_response: 'A proposta não passou na validação',
  provider_error: 'Serviço indisponível',
  unavailable: 'Sem conexão com o serviço',
  interrupted: 'Processamento interrompido',
};
const examples = [
  [
    'Letras',
    'Explorar o reconhecimento das letras A, E e I em palavras familiares, com instruções curtas e apoio visual.',
  ],
  [
    'Sílabas',
    'Formar palavras simples de duas sílabas sobre animais conhecidos, com seleção e ordenação.',
  ],
  [
    'Palavras',
    'Relacionar palavras do cotidiano aos seus significados e praticar escrita curta com variantes aceitas.',
  ],
  ['Frases', 'Ler frases curtas sobre um passeio no parque e interpretar informações explícitas.'],
] as const;
export function GenerateScreen({ navigation }: ScreenProps<'LessonAI'>) {
  const { colors, reducedMotion } = useTheme();
  const scroll = useRef<ScrollView | null>(null);
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState('pre-silabico');
  const [kinds, setKinds] = useState<Mechanic[]>(['single', 'order', 'text']);
  const [count, setCount] = useState('3');
  const [privacy, setPrivacy] = useState(false);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [preview, setPreview] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const health = useResource<{ ai: string }>('/health/ready');
  const history = useResource<{ items: Generation[]; next_offset: number | null }>(
    historyOpen ? '/ai/lesson-generations?offset=' + offset : null,
  );
  const generate = useCommand();
  const draft = useCommand();
  useEffect(() => {
    if (!generation) return;
    const timer = setTimeout(() => scroll.current?.scrollToEnd({ animated: !reducedMotion }), 200);
    return () => clearTimeout(timer);
  }, [generation?.id, reducedMotion]);
  const result = generation?.result?.lesson;
  const previewLesson: Lesson | null = result
    ? {
        id: 'proposal',
        title: result.title,
        version: 1,
        revision_id: 'proposal',
        status: 'draft',
        author_id: '',
        origin_content_id: null,
        origin_version: null,
        description: result.description,
        cover: result.cover,
        screen_count: result.screens.length,
        activity_kinds: kinds,
        permissions: { edit: false, copy: false, redistribute: false },
        body: result,
      }
    : null;
  async function recover(id: string) {
    setError('');
    try {
      setGeneration(await repository.get<Generation>('/ai/lesson-generations/' + id));
      setHistoryOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Page scrollRef={scroll}>
        <Eyebrow>DA SUA IDEIA À PRÓXIMA DESCOBERTA</Eyebrow>
        <Copy heading headingLevel={1} size="display">
          Crie com a Lumi
        </Copy>
        <Copy muted>Você define o objetivo. A IA prepara uma proposta editável.</Copy>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Action
            secondary
            icon={RotateCcw}
            title="Propostas anteriores"
            onPress={() => setHistoryOpen(true)}
          />
          <Action
            quiet
            title="Prefiro criar manualmente"
            onPress={() => navigation.navigate('LessonBuilder')}
          />
        </View>
        {health.data?.ai === 'not_configured' && (
          <Notice text="A geração precisa da chave Groq no backend. O editor manual e suas aulas continuam disponíveis." />
        )}
        <Card>
          <Copy heading>O que vamos ensinar?</Copy>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {examples.map(([title, text]) => (
              <Action
                key={title}
                secondary
                title={title}
                disabled={generate.busy}
                onPress={() => setObjective(text)}
              />
            ))}
          </View>
          <Field
            label="Objetivo da aula"
            value={objective}
            onChangeText={setObjective}
            multiline
            maxLength={1200}
            editable={!generate.busy}
          />
          <Copy size="caption" muted>
            Descreva o conteúdo, sem nomes, diagnósticos ou informações de estudantes. Imagens e
            áudio são adicionados por você no editor.
          </Copy>
          <Badge text={levelLabel(level) + ' · ' + count + ' atividades'} />
          <Action
            secondary
            title="Personalizar nível e formatos"
            disabled={generate.busy}
            onPress={() => setOptionsOpen(true)}
          />
          <Action
            secondary
            title="Meu pedido contém apenas objetivos e conteúdo pedagógico"
            selected={privacy}
            disabled={generate.busy}
            onPress={() => setPrivacy(!privacy)}
          />
          {!!kinds.length && kinds.length > Number(count) && (
            <Notice text="Escolha pelo menos uma atividade para cada formato selecionado." />
          )}
          {generate.busy && (
            <View
              accessibilityLiveRegion="polite"
              style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}
            >
              <ActivityIndicator color={colors.primary} />
              <Copy>Organizando conteúdo e atividades. Você poderá revisar tudo.</Copy>
            </View>
          )}
          {!!generate.error && (
            <Notice
              error
              text={
                generate.error +
                ' Consulte propostas anteriores antes de repetir um pedido interrompido.'
              }
            />
          )}
        </Card>
        {!!error && <Notice error text={error} />}
        {!!generation && (
          <Card>
            <Badge text={generationStatus[generation.status] || 'Estado indisponível'} />
            {result ? (
              <>
                <Copy heading>{result.title}</Copy>
                <Copy>{result.description}</Copy>
                <Copy muted>
                  {result.screens.length} telas ·{' '}
                  {result.screens.filter((s) => s.type === 'activity').length} atividades ·{' '}
                  {generation.origin === 'cached'
                    ? 'proposta reaproveitada'
                    : 'gerada pelo serviço'}
                </Copy>
                <Action
                  secondary
                  icon={Eye}
                  title="Experimentar a prévia"
                  onPress={() => setPreview(true)}
                />
                <Action
                  icon={Pencil}
                  title={generation.content_id ? 'Continuar no editor' : 'Revisar e editar aula'}
                  disabled={draft.busy}
                  onPress={() => {
                    if (generation.content_id)
                      navigation.navigate('LessonBuilder', { lessonId: generation.content_id });
                    else
                      void draft.run<Lesson>(
                        '/ai/lesson-generations/' + generation.id + '/draft',
                        {},
                        (lesson) => {
                          setGeneration({ ...generation, content_id: lesson.id });
                          navigation.navigate('LessonBuilder', { lessonId: lesson.id });
                        },
                      );
                  }}
                />
                <Copy size="caption" muted>
                  Confira objetivos, enunciados, gabaritos e adaptações antes de disponibilizar.{' '}
                  {generation.result?.warnings[0]}
                </Copy>
              </>
            ) : (
              <Copy>
                A criação manual continua disponível. Você pode consultar esta operação novamente ou
                fazer um novo pedido.
              </Copy>
            )}
            <Copy size="caption" muted>
              {generation.model} · {new Date(generation.created_at).toLocaleString('pt-BR')}
            </Copy>
            {!!draft.error && <Notice error text={draft.error} />}
          </Card>
        )}
        {preview && previewLesson && (
          <PreviewSheet local lesson={previewLesson} close={() => setPreview(false)} />
        )}
        <Sheet
          visible={optionsOpen}
          title="Personalizar a proposta"
          close={() => setOptionsOpen(false)}
          footer={<Action title="Usar estas opções" onPress={() => setOptionsOpen(false)} />}
        >
          <Copy>Nível do público-alvo</Copy>
          <Pills options={literacyOptions} value={level} onChange={setLevel} />
          <Copy>Quantas atividades?</Copy>
          <Pills
            options={['1', '2', '3', '4', '5', '6'].map((value) => ({ value, label: value }))}
            value={count}
            onChange={setCount}
          />
          <Copy>Formatos para explorar</Copy>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {mechanics.map((m) => (
              <Action
                key={m.value}
                secondary
                title={m.label}
                selected={kinds.includes(m.value)}
                onPress={() =>
                  setKinds((old) =>
                    old.includes(m.value) ? old.filter((k) => k !== m.value) : [...old, m.value],
                  )
                }
              />
            ))}
          </View>
          {kinds.length > Number(count) && (
            <Notice text="Escolha pelo menos uma atividade para cada formato." />
          )}
        </Sheet>
        <Sheet visible={historyOpen} title="Suas propostas" close={() => setHistoryOpen(false)}>
          <Action secondary title="Atualizar propostas" onPress={() => void history.reload()} />
          {history.loading && <Copy>Carregando…</Copy>}
          {!!history.error && <Notice error text={history.error} />}
          {history.data?.items.map((g) => (
            <MenuRow
              key={g.id}
              icon={Sparkles}
              title={generationStatus[g.status] || g.status}
              detail={new Date(g.created_at).toLocaleString('pt-BR')}
              onPress={() => void recover(g.id)}
            />
          ))}
          {history.data?.items.length === 0 && <Copy muted>Suas propostas aparecerão aqui.</Copy>}
          {!!offset && (
            <Action
              secondary
              title="Propostas mais recentes"
              onPress={() => setOffset(Math.max(0, offset - 10))}
            />
          )}
          {history.data?.next_offset != null && (
            <Action
              secondary
              title="Propostas anteriores"
              onPress={() => setOffset(history.data!.next_offset!)}
            />
          )}
          <SectionTitle title="Continue criando" />
          <Copy muted>Falhas da IA não alteram aulas já salvas.</Copy>
        </Sheet>
      </Page>
      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderColor: colors.divider,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ width: '100%', maxWidth: 1040, alignSelf: 'center' }}>
          <Action
            icon={Sparkles}
            title={generate.busy ? 'Preparando sua proposta…' : 'Gerar proposta de aula'}
            disabled={
              generate.busy ||
              !privacy ||
              objective.trim().length < 12 ||
              !kinds.length ||
              kinds.length > Number(count)
            }
            onPress={() => {
              setGeneration(null);
              void generate.run<Generation>(
                '/ai/lesson-generations',
                {
                  objective,
                  literacy_level: level,
                  mechanics: kinds,
                  activity_count: Number(count),
                  privacy_confirmed: true,
                },
                (value) => setGeneration(value),
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}
