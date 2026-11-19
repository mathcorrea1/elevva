import { useEffect, useState, useRef } from 'react';
import type { NavigationAction } from '@react-navigation/native';
import { View, FlatList, useWindowDimensions } from 'react-native';
import type { ScrollView } from 'react-native';
import {
  Plus,
  Copy as Duplicate,
  ArrowUp,
  ArrowDown,
  Eye,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react-native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { Pills, Eyebrow, Badge, Disclosure } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { IconAction } from '@/shared/ui/IconAction';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { ScreenProps } from '@/app/routes';
import { ImageSelector } from '@/features/trails/ImageSelector';
import { Activity } from './Activity';
import { ContentScreen } from './PlayerScreen';
import { QuestionEditor } from './QuestionEditor';
import { newQuestion } from './defaults';
import type { Lesson, LessonBody, LessonScreenData, ResponseValue } from './types';
import { emptyValue } from './types';
import { ScreenThumbnail } from './ScreenThumbnail';
import { literacyOptions } from '@/features/assessments/levels';
import { LibrasAction } from '@/features/accessibility/libras-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const screenTypes = [
  { value: 'text', label: 'Texto' },
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Vídeo' },
  { value: 'text_image', label: 'Texto e imagem' },
  { value: 'text_video', label: 'Texto e vídeo' },
  { value: 'activity', label: 'Atividade' },
  { value: 'completion', label: 'Conclusão' },
];
const screen = (type: LessonScreenData['type'] = 'text'): LessonScreenData => ({
  id: 's' + Date.now() + Math.floor(Math.random() * 100),
  type,
  title: '',
  text: '',
  instruction: '',
  image: null,
  video_id: null,
  transcript: '',
  media_reviewed: false,
  question: type === 'activity' ? newQuestion('q' + Date.now()) : null,
});
const initial: LessonBody = {
  description: '',
  objective: '',
  difficulty: 'not_defined',
  skills: [],
  audience: '',
  adaptations: '',
  cover: { builtin: 'sprout', alt: '' },
  screens: [],
  visibility: 'private',
  require_review_for_advance: false,
};
export function BuilderScreen({ route, navigation }: ScreenProps<'LessonBuilder'>) {
  const lid = route.params?.lessonId;
  const resource = useResource<Lesson>(lid ? '/lessons/' + lid : null);
  const save = useCommand();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState<LessonBody>({ ...initial, screens: [screen()] });
  const [saved, setSaved] = useState<Lesson | null>(null);
  const [loaded, setLoaded] = useState('');
  const [step, setStep] = useState('about');
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewValue, setPreviewValue] = useState<ResponseValue>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [modified, setModified] = useState(false);
  const [typePicker, setTypePicker] = useState(false);
  const [exitAction, setExitAction] = useState<NavigationAction | null>(null);
  const allowedExit = useRef(false);
  const scroll = useRef<ScrollView | null>(null);
  const thumbnails = useRef<FlatList<LessonScreenData> | null>(null);
  const thumbnailWidth = width < 500 ? 150 : 180;
  useEffect(() => {
    if (index < body.screens.length)
      thumbnails.current?.scrollToOffset({
        offset: Math.max(0, index - 1) * (thumbnailWidth + 10),
        animated: false,
      });
  }, [index, body.screens.length, thumbnailWidth]);
  function selectScreen(index: number) {
    setIndex(index);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function changeStep(value: string) {
    setStep(value);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (preview) {
          e.preventDefault();
          setPreview(false);
          return;
        }
        if (!modified || allowedExit.current) return;
        e.preventDefault();
        setExitAction(e.data.action);
      }),
    [navigation, modified, preview],
  );
  useEffect(() => {
    const l = resource.data;
    if (!l || loaded === l.id) return;
    setLoaded(l.id);
    setTitle(l.title);
    setBody(
      Object.fromEntries(
        Object.keys(initial).map((key) => [
          key,
          key in l.body ? l.body[key as keyof LessonBody] : initial[key as keyof LessonBody],
        ]),
      ) as LessonBody,
    );
    setSaved(l);
    setModified(false);
  }, [resource.data, loaded]);
  function patch(p: Partial<LessonBody>) {
    setBody((b) => ({ ...b, ...p }));
    setModified(true);
  }
  const current = body.screens[index];
  function patchScreen(p: Partial<LessonScreenData>) {
    patch({ screens: body.screens.map((s, i) => (i === index ? { ...s, ...p } : s)) });
  }
  function move(delta: number) {
    const s = [...body.screens];
    [s[index], s[index + delta]] = [s[index + delta], s[index]];
    patch({ screens: s });
    setIndex(index + delta);
  }
  async function persist() {
    await save.run<Lesson>(
      saved ? '/lesson-drafts/' + saved.id + '/revisions' : '/lesson-drafts',
      {
        ...body,
        skills: body.skills.filter((s) => s.trim()),
        title,
        ...(saved ? { version: saved.version } : {}),
      },
      (l) => {
        setSaved(l);
        setModified(false);
      },
    );
  }
  const p = body.screens[previewIndex];
  // Existing content must hydrate before editing; a late response cannot replace typed text.
  if (lid && saved?.id !== lid)
    return (
      <Page title="Abrindo sua aula">
        <LoadState resource={resource} />
        <Action
          secondary
          icon={ArrowLeft}
          title="Voltar às aulas"
          onPress={() => navigation.goBack()}
        />
      </Page>
    );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          padding: 16,
          paddingTop: Math.max(16, insets.top + 8),
          gap: 10,
          borderBottomWidth: 1,
          borderColor: colors.divider,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <IconAction icon={ArrowLeft} label="Voltar" onPress={() => navigation.goBack()} />
          <View style={{ flex: 1 }}>
            <Copy heading>Ateliê</Copy>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <LibrasAction />
            <IconAction
              icon={Eye}
              label="Prévia"
              disabled={!body.screens.length}
              onPress={() => {
                setPreviewIndex(index);
                setPreviewValue(null);
                setPreview(true);
              }}
            />
            <Action
              icon={Save}
              title={save.busy ? 'Salvando…' : 'Salvar'}
              accessibilityLabel="Salvar rascunho"
              disabled={title.trim().length < 2 || save.busy || (!!lid && !saved)}
              onPress={() => void persist()}
            />
          </View>
        </View>
        <Pills
          value={step}
          options={[
            { value: 'about', label: '1. Sobre' },
            { value: 'screens', label: '2. Telas' },
            { value: 'publish', label: '3. Publicar' },
          ]}
          onChange={changeStep}
        />
        {step === 'screens' && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <IconAction
              icon={ArrowLeft}
              label="Tela anterior do editor"
              disabled={!index}
              onPress={() => selectScreen(index - 1)}
            />
            <View style={{ flex: 1 }}>
              <Copy muted size="caption">
                Tela {body.screens.length ? index + 1 : 0} de {body.screens.length}
              </Copy>
            </View>
            <IconAction
              icon={ArrowRight}
              label="Próxima tela do editor"
              disabled={index >= body.screens.length - 1}
              onPress={() => selectScreen(index + 1)}
            />
            <IconAction
              icon={Plus}
              label="Adicionar tela ao editor"
              disabled={body.screens.length >= 40}
              onPress={() => {
                patch({ screens: [...body.screens, screen()] });
                selectScreen(body.screens.length);
              }}
            />
          </View>
        )}
        {!!save.error && <Notice error text={save.error} />}
        {!modified && !!saved && (
          <View accessibilityLiveRegion="polite">
            <Copy muted size="caption">
              Versão {saved.version} salva ·{' '}
              {saved.status === 'draft'
                ? 'rascunho'
                : saved.status === 'synthetic'
                  ? 'demonstração técnica'
                  : 'publicada'}
            </Copy>
          </View>
        )}
        {modified && (
          <Copy muted size="caption">
            Alterações ainda não salvas no servidor.
          </Copy>
        )}
      </View>
      <Page scrollRef={scroll}>
        <LoadState resource={resource} />
        {step === 'about' ? (
          <>
            <Eyebrow>UMA IDEIA, MUITAS DESCOBERTAS</Eyebrow>
            <Copy heading headingLevel={1} size="display">
              O que vamos aprender?
            </Copy>
            <Card>
              <Field
                label="Título da aula"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  setModified(true);
                }}
                maxLength={120}
              />
              <Copy>Nível do público-alvo</Copy>
              <Pills
                value={body.literacy_level || ''}
                options={[{ value: '', label: 'Não definido' }, ...literacyOptions]}
                onChange={(v) => patch({ literacy_level: v || null })}
              />
              <Field
                label="Descrição breve"
                value={body.description}
                onChangeText={(description) => patch({ description })}
                multiline
                maxLength={600}
              />
              <Field
                label="Objetivos pedagógicos"
                value={body.objective}
                onChangeText={(objective) => patch({ objective })}
                multiline
                maxLength={1000}
              />
              <Copy>Dificuldade indicada pelo autor</Copy>
              <Pills
                value={body.difficulty}
                options={[
                  { value: 'not_defined', label: 'Não definida' },
                  { value: 'initial', label: 'Introdução' },
                  { value: 'practice', label: 'Prática' },
                  { value: 'extension', label: 'Ampliação' },
                ]}
                onChange={(v) => patch({ difficulty: v as LessonBody['difficulty'] })}
              />
              <Field
                label="Habilidades (separe por vírgula)"
                value={body.skills.join(', ')}
                onChangeText={(t) =>
                  patch({
                    skills: t
                      .split(',')
                      .map((s) => s.trim())
                      .slice(0, 20),
                  })
                }
                maxLength={1000}
              />
              <Disclosure title="Capa, público e adaptações">
                <ImageSelector value={body.cover} onChange={(cover) => patch({ cover })} cover />
                <Field
                  label="Público-alvo"
                  value={body.audience}
                  maxLength={500}
                  multiline
                  onChangeText={(audience) => patch({ audience })}
                />
                <Field
                  label="Adaptações pedagógicas possíveis"
                  value={body.adaptations}
                  maxLength={1000}
                  multiline
                  onChangeText={(adaptations) => patch({ adaptations })}
                />
              </Disclosure>
              <Copy muted>
                A aula é reutilizável. Depois de disponibilizar uma versão, ela pode ser incluída em
                uma ou mais trilhas.
              </Copy>
              <Action title="Montar as telas" onPress={() => changeStep('screens')} />
            </Card>
          </>
        ) : step === 'screens' ? (
          <>
            <Eyebrow>CONTE UMA HISTÓRIA, PASSO A PASSO</Eyebrow>
            <Copy heading headingLevel={1}>
              As telas da aula
            </Copy>
            <FlatList
              ref={thumbnails}
              horizontal
              data={body.screens}
              keyExtractor={(s) => s.id}
              initialNumToRender={6}
              windowSize={5}
              contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
              getItemLayout={(_, i) => ({
                length: thumbnailWidth + 10,
                offset: (thumbnailWidth + 10) * i,
                index: i,
              })}
              renderItem={({ item: s, index: i }) => (
                <View style={{ width: thumbnailWidth }}>
                  <ScreenThumbnail
                    screen={s}
                    index={i}
                    selected={i === index}
                    onPress={() => selectScreen(i)}
                  />
                </View>
              )}
            />
            {current && (
              <Card>
                <Badge text={'TELA ' + (index + 1) + ' DE ' + body.screens.length} />
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <Copy>{screenTypes.find((t) => t.value === current.type)?.label}</Copy>
                  <Action
                    secondary
                    quiet
                    title="Alterar tipo de tela"
                    onPress={() => setTypePicker(true)}
                  />
                </View>
                <Field
                  label="Título da tela"
                  value={current.title}
                  maxLength={160}
                  onChangeText={(title) => patchScreen({ title })}
                />
                {current.type !== 'activity' && (
                  <Field
                    label="Texto da tela"
                    value={current.text}
                    multiline
                    maxLength={5000}
                    onChangeText={(text) => patchScreen({ text })}
                  />
                )}
                {['image', 'text_image', 'completion'].includes(current.type) && (
                  <ImageSelector
                    value={current.image}
                    onChange={(image) => patchScreen({ image })}
                  />
                )}
                {['video', 'text_video'].includes(current.type) && (
                  <>
                    <Field
                      label="Link ou identificador do YouTube"
                      value={current.video_id || ''}
                      maxLength={200}
                      onChangeText={(t) => {
                        const found = t.match(/(?:youtu\.be\/|[?&]v=|embed\/)([\w-]{11})/);
                        patchScreen({ video_id: found ? found[1] : t });
                      }}
                    />
                    <Field
                      label="Alternativa textual ao vídeo"
                      value={current.transcript}
                      multiline
                      maxLength={5000}
                      onChangeText={(transcript) => patchScreen({ transcript })}
                    />
                    <Action
                      secondary
                      selected={current.media_reviewed}
                      title={
                        'Direitos, público, legendas e alternativa revisados: ' +
                        (current.media_reviewed ? 'sim' : 'não')
                      }
                      onPress={() => patchScreen({ media_reviewed: !current.media_reviewed })}
                    />
                    <Copy muted>
                      Vídeos dependem de rede e revisão de direitos/termos para uso infantil. A
                      alternativa textual permanece disponível.
                    </Copy>
                  </>
                )}
                {current.type === 'activity' && current.question && (
                  <QuestionEditor
                    question={current.question}
                    onChange={(question) => patchScreen({ question })}
                  />
                )}
                <Disclosure title="Organizar esta tela">
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <Action
                      secondary
                      icon={ArrowUp}
                      title="Mover antes"
                      disabled={!index}
                      onPress={() => move(-1)}
                    />
                    <Action
                      secondary
                      icon={ArrowDown}
                      title="Mover depois"
                      disabled={index === body.screens.length - 1}
                      onPress={() => move(1)}
                    />
                    <Action
                      secondary
                      icon={Duplicate}
                      title="Duplicar tela"
                      disabled={body.screens.length >= 40}
                      onPress={() => {
                        const copy = JSON.parse(JSON.stringify(current)) as LessonScreenData;
                        copy.id = 's' + Date.now();
                        if (copy.question) copy.question.id = 'q' + Date.now();
                        const screens = [...body.screens];
                        screens.splice(index + 1, 0, copy);
                        patch({ screens });
                        setIndex(index + 1);
                      }}
                    />
                    <Action
                      secondary
                      destructive
                      icon={Trash2}
                      title="Excluir tela"
                      onPress={() => setConfirmDelete(true)}
                    />
                  </View>
                </Disclosure>
              </Card>
            )}
            <Action
              secondary
              icon={Plus}
              title="Adicionar tela"
              disabled={body.screens.length >= 40}
              onPress={() => {
                patch({ screens: [...body.screens, screen()] });
                setIndex(body.screens.length);
              }}
            />
            <Action title="Preparar disponibilização" onPress={() => changeStep('publish')} />
          </>
        ) : (
          <Card>
            <Copy heading headingLevel={1}>
              Pronta para novas descobertas?
            </Copy>
            <Copy>
              {body.screens.length} telas ·{' '}
              {body.screens.filter((s) => s.type === 'activity').length} atividades
            </Copy>
            <Notice text="Rascunho e demonstração técnica não equivalem a aprovação pedagógica. Publicação real exige revisão designada desta versão (D03)." />
            <Copy>Visibilidade após publicação revisada</Copy>
            <Pills
              value={body.visibility}
              options={[
                { value: 'private', label: 'Privada / compartilhada' },
                { value: 'public', label: 'Biblioteca pública' },
              ]}
              onChange={(v) => patch({ visibility: v as 'private' | 'public' })}
            />
            <Action
              secondary
              title={
                'Aguardar revisão escrita para concluir: ' +
                (body.require_review_for_advance ? 'sim' : 'não')
              }
              selected={body.require_review_for_advance}
              onPress={() =>
                patch({ require_review_for_advance: !body.require_review_for_advance })
              }
            />
            <Action
              title="Disponibilizar demonstração sintética"
              disabled={!saved || modified || save.busy}
              onPress={() =>
                void save.run<Lesson>(
                  '/lessons/' + saved?.id + '/publish?synthetic=true',
                  { version: saved?.version },
                  (l) => {
                    setSaved(l);
                    navigation.replace('LessonLibrary');
                  },
                )
              }
            />
            <Action
              secondary
              title="Publicar versão revisada"
              disabled={!saved || modified || save.busy}
              onPress={() =>
                void save.run<Lesson>(
                  '/lessons/' + saved?.id + '/publish',
                  { version: saved?.version },
                  () => navigation.replace('LessonLibrary'),
                )
              }
            />
            {(!saved || modified) && (
              <Copy muted>Salve o rascunho no botão do cabeçalho antes de disponibilizar.</Copy>
            )}
          </Card>
        )}
      </Page>
      <Sheet visible={typePicker} title="Escolher tipo de tela" close={() => setTypePicker(false)}>
        {screenTypes.map((type) => (
          <Action
            key={type.value}
            secondary
            title={type.label}
            selected={current?.type === type.value}
            onPress={() => {
              patchScreen({
                type: type.value as LessonScreenData['type'],
                question:
                  type.value === 'activity'
                    ? current?.question || newQuestion('q' + Date.now())
                    : null,
              });
              setTypePicker(false);
            }}
          />
        ))}
      </Sheet>
      <Sheet
        visible={!!exitAction}
        title="Há alterações não salvas"
        close={() => setExitAction(null)}
      >
        <Copy>
          Salve o rascunho para continuar em outro momento. Sair agora descarta apenas as alterações
          feitas desde o último salvamento.
        </Copy>
        <Action title="Continuar editando" onPress={() => setExitAction(null)} />
        <Action
          secondary
          destructive
          title="Sair sem salvar as alterações"
          onPress={() => {
            allowedExit.current = true;
            if (exitAction) navigation.dispatch(exitAction);
          }}
        />
      </Sheet>
      <Sheet
        visible={confirmDelete}
        title="Excluir tela do rascunho?"
        close={() => setConfirmDelete(false)}
      >
        <Copy>Versões já atribuídas e respostas anteriores serão preservadas.</Copy>
        <Action
          destructive
          title="Excluir esta tela"
          onPress={() => {
            patch({ screens: body.screens.filter((_, i) => i !== index) });
            setIndex(Math.max(0, index - 1));
            setConfirmDelete(false);
          }}
        />
      </Sheet>
      <Sheet
        visible={preview}
        title={'Prévia · tela ' + (previewIndex + 1)}
        close={() => setPreview(false)}
      >
        <Badge text="PRÉVIA DO AUTOR · NÃO GERA TENTATIVAS" />
        {p && (
          <>
            <Copy heading>{p.title || 'Tela sem título'}</Copy>
            <ContentScreen screen={p} />
            {p.question && (
              <>
                <Copy>{p.question.prompt}</Copy>
                <Activity
                  key={p.id}
                  question={p.question}
                  value={previewValue ?? emptyValue(p.question.kind)}
                  onChange={setPreviewValue}
                />
              </>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Action
                secondary
                title="Prévia anterior"
                disabled={!previewIndex}
                onPress={() => {
                  setPreviewIndex(previewIndex - 1);
                  setPreviewValue(null);
                }}
              />
              <Action
                title="Próxima prévia"
                disabled={previewIndex >= body.screens.length - 1}
                onPress={() => {
                  setPreviewIndex(previewIndex + 1);
                  setPreviewValue(null);
                }}
              />
            </View>
          </>
        )}
      </Sheet>
    </View>
  );
}
