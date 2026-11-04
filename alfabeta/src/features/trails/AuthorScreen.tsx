import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2, Archive } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Badge, Eyebrow, Pills } from '@/shared/ui/learning';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import type { Content } from '@/shared/contracts';
import type { ScreenProps } from '@/app/routes';
import type { ImageRef, TrailDefinition } from './types';
import { ImageSelector } from './ImageSelector';
import type { Lesson, Paged } from '@/features/lessons/types';
type DraftItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  skill: string;
  required: boolean;
  reading_allowed: boolean;
};
type DraftLesson = {
  key: string;
  title: string;
  objective: string;
  image: ImageRef | null;
  instructions: string;
  concise_instructions: string;
  mode: 'inline' | 'reuse' | 'lesson';
  lesson_revision_id: string | null;
  content_ids: string[];
  items: DraftItem[];
  threshold: boolean;
  percent: string;
};
const newItem = (index: number): DraftItem => ({
  id: 'q' + index,
  prompt: '',
  choices: ['', ''],
  answer: 0,
  skill: '',
  required: true,
  reading_allowed: false,
});
const newLesson = (index: number): DraftLesson => ({
  key: 'aula-' + index,
  title: '',
  objective: '',
  image: { builtin: (['sprout', 'butterfly', 'boat'] as const)[(index - 1) % 3], alt: '' },
  instructions: 'Escolha uma opção e confirme sua resposta.',
  concise_instructions: '',
  mode: 'inline',
  lesson_revision_id: null,
  content_ids: [],
  items: [newItem(1)],
  threshold: false,
  percent: '',
});
export function AuthorScreen({ route, navigation }: ScreenProps<'TrailAuthor'>) {
  const tid = route.params?.trailId;
  const resource = useResource<TrailDefinition>(tid ? '/trails/' + tid : null);
  const me = useResource<{ id: string; profession: string }>('/me');
  const catalog = useResource<Content[]>('/content');
  const reusable = useResource<Paged<Lesson>>('/lessons?scope=mine&limit=50');
  const received = useResource<Paged<Lesson>>('/lessons?scope=shared&limit=50');
  const reusableLessons = [...(reusable.data?.items || []), ...(received.data?.items || [])].filter(
    (l) => l.status !== 'draft',
  );
  const save = useCommand();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState<ImageRef | null>({ builtin: 'garden', alt: '' });
  const [scenario, setScenario] = useState<'garden' | 'sky'>('garden');
  const [availability, setAvailability] = useState<'sequential' | 'free'>('sequential');
  const [status, setStatus] = useState('draft');
  const [lessons, setLessons] = useState<DraftLesson[]>([newLesson(1)]);
  const [editing, setEditing] = useState<number | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [archive, setArchive] = useState(false);
  const [remove, setRemove] = useState<number | null>(null);
  const [loaded, setLoaded] = useState('');
  useEffect(() => {
    const t = resource.data;
    if (!t || loaded === t.id + ':' + t.version) return;
    setLoaded(t.id + ':' + t.version);
    setTitle(t.title);
    setDescription(t.description);
    setCover(t.cover);
    setScenario(t.scenario);
    setAvailability(t.availability);
    setStatus(t.status);
    setLessons(
      t.lessons.map((l) => ({
        ...newLesson(1),
        ...l,
        mode: l.lesson_revision_id ? 'lesson' : 'reuse',
        content_ids: l.contents.map((c) => c.id),
        items: l.contents
          .flatMap((c) => c.items)
          .map((i, n) => ({ ...newItem(n + 1), ...i, id: 'q' + (n + 1) })),
        threshold: l.advance_percent !== null,
        percent: l.advance_percent === null ? '' : String(l.advance_percent),
      })),
    );
  }, [resource.data, loaded]);
  const canEdit =
    me.data?.profession === 'teacher' && (!tid || resource.data?.author_id === me.data.id);
  const current = editing === null ? null : lessons[editing];
  const item = current?.items[itemIndex];
  function patchLesson(patch: Partial<DraftLesson>) {
    if (editing !== null)
      setLessons((previous) => previous.map((l, i) => (i === editing ? { ...l, ...patch } : l)));
  }
  function patchItem(patch: Partial<DraftItem>) {
    if (current)
      patchLesson({
        items: current.items.map((q, i) => (i === itemIndex ? { ...q, ...patch } : q)),
      });
  }
  function move(index: number, offset: number) {
    setLessons((prev) => {
      const result = [...prev];
      [result[index], result[index + offset]] = [result[index + offset], result[index]];
      return result;
    });
  }
  const valid =
    title.trim().length >= 2 &&
    description.trim().length >= 2 &&
    lessons.length > 0 &&
    lessons.every(
      (l) =>
        l.title.trim().length >= 2 &&
        l.objective.trim().length >= 2 &&
        l.instructions.trim().length >= 2 &&
        (!l.threshold || (/^\d{1,3}$/.test(l.percent) && Number(l.percent) <= 100)) &&
        (l.mode === 'lesson'
          ? !!l.lesson_revision_id
          : l.mode === 'reuse'
            ? l.content_ids.length > 0
            : l.items.length > 0 &&
              l.items.some((i) => i.required) &&
              l.items.every(
                (i) =>
                  i.prompt.trim() &&
                  i.choices.length >= 2 &&
                  i.choices.every((c) => c.trim()) &&
                  new Set(i.choices.map((c) => c.trim())).size === i.choices.length,
              )),
    );
  async function submit() {
    const body = {
      title,
      description,
      cover,
      scenario,
      availability,
      status,
      lessons: lessons.map((l) => ({
        key: l.key,
        title: l.title,
        objective: l.objective,
        image: l.image,
        instructions: l.instructions,
        concise_instructions: l.concise_instructions,
        advance_percent: l.threshold ? Number(l.percent) : null,
        content_ids: l.mode === 'reuse' ? l.content_ids : [],
        lesson_revision_id: l.mode === 'lesson' ? l.lesson_revision_id : null,
        items: l.mode === 'inline' ? l.items : [],
      })),
      ...(tid ? { version: resource.data?.version } : {}),
    };
    await save.run(tid ? '/trails/' + tid + '/revisions' : '/trails', body, () =>
      navigation.goBack(),
    );
  }
  return (
    <Page>
      <Eyebrow>ATELIÊ DO PROFESSOR</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        {tid ? 'Cuidar de uma trilha' : 'Criar um novo caminho'}
      </Copy>
      <LoadState resource={resource} />
      <LoadState resource={me} />
      {!canEdit && !me.loading && (
        <Notice text="Autoria disponível somente ao professor que criou esta trilha." />
      )}
      {canEdit && (
        <>
          <Notice text="Nome, ordem, habilidades e critérios são escolhas do autor. Demonstrações não equivalem a currículo ou instrumento validado." />
          <Card>
            <Field label="Nome da trilha" value={title} onChangeText={setTitle} maxLength={120} />
            <Field
              label="Descrição breve"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={600}
            />
            <Copy heading>Capa da trilha</Copy>
            <ImageSelector value={cover} onChange={setCover} cover />
            <Copy heading>Cenário do mapa</Copy>
            <Pills
              value={scenario}
              options={[
                { value: 'garden', label: 'Jardim' },
                { value: 'sky', label: 'Céu de histórias' },
              ]}
              onChange={(v) => setScenario(v as typeof scenario)}
            />
            <Copy muted>
              O cenário organiza o mapa. A capa e as imagens das aulas são independentes.
            </Copy>
            <Copy>Disponibilidade das aulas</Copy>
            <Pills
              value={availability}
              options={[
                { value: 'sequential', label: 'Em sequência' },
                { value: 'free', label: 'Escolha livre após avaliação' },
              ]}
              onChange={(v) => setAvailability(v as typeof availability)}
            />
          </Card>
          <Copy heading>Aulas da trilha</Copy>
          {lessons.map((l, i) => (
            <Card key={l.key}>
              <Badge text={'AULA ' + (i + 1)} />
              <Copy heading>{l.title || 'Aula ainda sem título'}</Copy>
              <Copy muted>
                {l.mode === 'inline'
                  ? l.items.length + ' questões em preparação'
                  : l.content_ids.length + ' atividades selecionadas'}
              </Copy>
              <Action
                secondary
                icon={Pencil}
                title={'Configurar aula ' + (i + 1)}
                onPress={() => {
                  setEditing(i);
                  setItemIndex(0);
                }}
              />
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Action
                  secondary
                  icon={ArrowUp}
                  title="Mover antes"
                  disabled={i === 0}
                  onPress={() => move(i, -1)}
                />
                <Action
                  secondary
                  icon={ArrowDown}
                  title="Mover depois"
                  disabled={i === lessons.length - 1}
                  onPress={() => move(i, 1)}
                />
                <Action
                  secondary
                  destructive
                  icon={Trash2}
                  title="Remover aula do rascunho"
                  onPress={() => setRemove(i)}
                />
              </View>
            </Card>
          ))}
          <Action
            secondary
            icon={Plus}
            title="Adicionar aula"
            disabled={lessons.length >= 12}
            onPress={() => setLessons((prev) => [...prev, newLesson(Date.now())])}
          />
          <Card>
            <Copy heading>Situação do conteúdo</Copy>
            <Pills
              value={status}
              options={[
                { value: 'draft', label: 'Rascunho para revisão' },
                { value: 'synthetic', label: 'Demonstração sintética' },
                { value: 'published', label: 'Publicar conteúdos revisados' },
              ]}
              onChange={setStatus}
            />
            <Copy muted>
              Demonstração técnica só é aceita em desenvolvimento/teste. Publicação exige atividades
              publicadas e revisadas. Critério adicional de acertos precisa de validação pedagógica.
            </Copy>
            <Action
              title={
                save.busy
                  ? 'Salvando trilha…'
                  : tid
                    ? 'Salvar nova versão'
                    : 'Salvar trilha e aulas'
              }
              disabled={!valid || save.busy}
              onPress={() => void submit()}
            />
            {!valid && (
              <Copy muted>
                Complete título, descrição, objetivos e questões/atividades de todas as aulas para
                salvar.
              </Copy>
            )}
            <SaveState command={save} />
          </Card>
          {tid && (
            <Action
              secondary
              destructive
              icon={Archive}
              title="Arquivar esta trilha"
              onPress={() => setArchive(true)}
            />
          )}
        </>
      )}
      <Sheet
        visible={editing !== null}
        title={editing === null ? 'Aula' : 'Configurar aula ' + (editing + 1)}
        close={() => setEditing(null)}
      >
        {current && (
          <>
            <Field
              label="Título da aula"
              value={current.title}
              onChangeText={(title) => patchLesson({ title })}
              maxLength={120}
            />
            <Field
              label="Objetivo da aula"
              value={current.objective}
              onChangeText={(objective) => patchLesson({ objective })}
              multiline
              maxLength={500}
            />
            <Copy heading>Imagem da aula</Copy>
            <ImageSelector value={current.image} onChange={(image) => patchLesson({ image })} />
            <Field
              label="Instrução principal"
              value={current.instructions}
              onChangeText={(instructions) => patchLesson({ instructions })}
              multiline
              maxLength={1500}
            />
            <Field
              label="Instrução curta opcional"
              value={current.concise_instructions}
              onChangeText={(concise_instructions) => patchLesson({ concise_instructions })}
              multiline
              maxLength={500}
            />
            <Pills
              value={current.mode}
              options={[
                { value: 'lesson', label: 'Aula com telas da biblioteca' },
                { value: 'inline', label: 'Criar/copiar questões' },
                { value: 'reuse', label: 'Atividades da biblioteca' },
              ]}
              onChange={(v) => patchLesson({ mode: v as DraftLesson['mode'] })}
            />
            {current.mode === 'lesson' ? (
              <>
                <Copy>
                  Selecione uma versão reutilizável. Ela será referenciada sem copiar as telas a
                  cada atribuição.
                </Copy>
                {reusableLessons.map((l) => (
                  <Action
                    key={l.revision_id}
                    secondary
                    selected={current.lesson_revision_id === l.revision_id}
                    title={l.title + ' · v' + l.version}
                    onPress={() =>
                      patchLesson({
                        lesson_revision_id: l.revision_id,
                        title: l.title,
                        objective: l.description.slice(0, 500),
                        instructions: l.description,
                        image: l.cover,
                      })
                    }
                  />
                ))}
                <Action
                  secondary
                  title="Criar aula no ateliê"
                  onPress={() => navigation.navigate('LessonBuilder')}
                />
                {!reusableLessons.length && (
                  <Copy>
                    Disponibilize uma aula no ateliê ou aceite um compartilhamento para reutilizar
                    aqui.
                  </Copy>
                )}
              </>
            ) : current.mode === 'reuse' ? (
              <>
                <LoadState resource={catalog} />
                {catalog.data
                  ?.filter((c) => c.kind === 'activity' && !c.archived_at)
                  .map((c) => (
                    <Action
                      secondary
                      key={c.id}
                      selected={current.content_ids.includes(c.id)}
                      title={c.title}
                      onPress={() =>
                        patchLesson({
                          content_ids: current.content_ids.includes(c.id)
                            ? current.content_ids.filter((id) => id !== c.id)
                            : [...current.content_ids, c.id].slice(0, 6),
                        })
                      }
                    />
                  ))}
              </>
            ) : (
              <>
                <Copy muted>
                  Editar questões cria conteúdo de nova versão. Entregas anteriores não são
                  alteradas.
                </Copy>
                <Pills
                  value={String(itemIndex)}
                  options={current.items.map((_, i) => ({
                    value: String(i),
                    label: 'Questão ' + (i + 1),
                  }))}
                  onChange={(v) => setItemIndex(Number(v))}
                />
                {item && (
                  <>
                    <Field
                      label="Enunciado da questão"
                      value={item.prompt}
                      onChangeText={(prompt) => patchItem({ prompt })}
                      multiline
                      maxLength={400}
                    />
                    <Field
                      label="Habilidade (rótulo docente)"
                      value={item.skill}
                      onChangeText={(skill) => patchItem({ skill })}
                      maxLength={100}
                    />
                    {item.choices.map((choice, i) => (
                      <Field
                        key={i}
                        label={'Alternativa ' + String.fromCharCode(65 + i)}
                        value={choice}
                        onChangeText={(text) =>
                          patchItem({ choices: item.choices.map((c, n) => (n === i ? text : c)) })
                        }
                        maxLength={100}
                      />
                    ))}
                    <Pills
                      value={String(item.answer)}
                      options={item.choices.map((_, i) => ({
                        value: String(i),
                        label: 'Gabarito ' + String.fromCharCode(65 + i),
                      }))}
                      onChange={(v) => patchItem({ answer: Number(v) })}
                    />
                    <Action
                      secondary
                      title={'Questão obrigatória: ' + (item.required ? 'sim' : 'não')}
                      selected={item.required}
                      onPress={() => patchItem({ required: !item.required })}
                    />
                    <Action
                      secondary
                      title={
                        'Leitura do enunciado: ' +
                        (item.reading_allowed ? 'permitida' : 'não permitida')
                      }
                      selected={item.reading_allowed}
                      onPress={() => patchItem({ reading_allowed: !item.reading_allowed })}
                    />
                    <Action
                      secondary
                      title="Adicionar alternativa"
                      disabled={item.choices.length >= 6}
                      onPress={() => patchItem({ choices: [...item.choices, ''] })}
                    />
                    <Action
                      secondary
                      title="Remover última alternativa"
                      disabled={item.choices.length <= 2}
                      onPress={() =>
                        patchItem({
                          choices: item.choices.slice(0, -1),
                          answer: Math.min(item.answer, item.choices.length - 2),
                        })
                      }
                    />
                    <Action
                      secondary
                      destructive
                      title="Remover questão"
                      disabled={current.items.length <= 1}
                      onPress={() => {
                        patchLesson({
                          items: current.items
                            .filter((_, i) => i !== itemIndex)
                            .map((q, i) => ({ ...q, id: 'q' + (i + 1) })),
                        });
                        setItemIndex(Math.max(0, itemIndex - 1));
                      }}
                    />
                  </>
                )}
                <Action
                  secondary
                  title="Adicionar questão"
                  disabled={current.items.length >= 20}
                  onPress={() => {
                    patchLesson({ items: [...current.items, newItem(current.items.length + 1)] });
                    setItemIndex(current.items.length);
                  }}
                />
              </>
            )}
            <Copy heading>Conclusão e avanço</Copy>
            <Copy>
              Entregar todas as questões obrigatórias é a regra de conclusão. Questões opcionais não
              respondidas não recebem zero.
            </Copy>
            <Action
              secondary
              selected={current.threshold}
              title={
                current.threshold
                  ? 'Critério extra de acertos ativado'
                  : 'Configurar critério extra de acertos'
              }
              onPress={() => patchLesson({ threshold: !current.threshold })}
            />
            {current.threshold && (
              <Field
                label="Percentual mínimo explícito (0 a 100)"
                value={current.percent}
                onChangeText={(percent) => patchLesson({ percent })}
                keyboardType="number-pad"
                maxLength={3}
              />
            )}
            <Copy muted>
              Sem critério extra, basta entregar as obrigatórias para avançar. Repetição preserva a
              tentativa anterior e só está disponível se o avanço não foi obtido. Não altera nível
              de alfabetização.
            </Copy>
            <Action title="Voltar às aulas do rascunho" onPress={() => setEditing(null)} />
          </>
        )}
      </Sheet>
      <Sheet
        visible={remove !== null}
        title="Remover aula desta versão?"
        close={() => setRemove(null)}
      >
        <Copy>
          Isso altera apenas o rascunho em edição. Respostas e versões já atribuídas continuam
          preservadas.
        </Copy>
        <Action secondary title="Cancelar" onPress={() => setRemove(null)} />
        <Action
          destructive
          title="Remover aula do rascunho"
          onPress={() => {
            setLessons((prev) => prev.filter((_, i) => i !== remove));
            setRemove(null);
          }}
        />
      </Sheet>
      <Sheet visible={archive} title="Arquivar trilha?" close={() => setArchive(false)}>
        <Copy>
          Novas atribuições deixarão de usar a trilha. Percursos e respostas já salvos continuarão
          acessíveis.
        </Copy>
        <Action secondary title="Cancelar" onPress={() => setArchive(false)} />
        <Action
          destructive
          icon={Archive}
          title="Arquivar trilha"
          disabled={save.busy}
          onPress={() =>
            void save.run('/trails/' + tid + '/archive', { version: resource.data?.version }, () =>
              navigation.goBack(),
            )
          }
        />
        <SaveState command={save} />
      </Sheet>
    </Page>
  );
}
