import { useState } from 'react';
import { Page, Card, Copy, Action, Field, Notice, Loading } from '@/shared/ui';
import { useResource, useCommand } from '@/shared/data/hooks';
import { Sheet } from '@/shared/ui/Sheet';
import { Archive, ArchiveRestore } from 'lucide-react-native';
import { SaveState } from '@/shared/ui/ResourceState';
import type { Content } from '@/shared/contracts';
import { ContentReviewCard } from './ContentReviewCard';
import { ContentDetails } from './ContentDetails';
import { ContentEditor } from './ContentEditor';
import { ContentRevisionHistory } from './ContentRevisionHistory';
import { Eyebrow, Pills, SectionTitle } from '@/shared/ui/learning';

export function LibraryScreen() {
  const resource = useResource<Content[]>('/content');
  const me = useResource<{
    id: string;
    profession: string;
    capabilities: { review_pedagogy: boolean };
  }>('/me');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [history, setHistory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Content['kind'] | null>(null);
  const [archived, setArchived] = useState(false);
  const [confirm, setConfirm] = useState<Content | null>(null);
  const save = useCommand();
  const matching = resource.data?.filter(
    (content) =>
      !!content.archived_at === archived &&
      (!filter || content.kind === filter) &&
      content.title.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')),
  );
  return (
    <Page>
      <Eyebrow>IDEIAS PARA CADA DESCOBERTA</Eyebrow>
      <SectionTitle
        title="Sua biblioteca"
        detail="Atividades, orientações e instrumentos em um só lugar."
      />
      <Field label="Buscar pelo título" value={search} onChangeText={setSearch} maxLength={120} />
      <Pills
        value={filter || 'all'}
        options={[
          { value: 'all', label: 'Todos' },
          { value: 'activity', label: 'Atividades' },
          { value: 'guidance', label: 'Orientações' },
          { value: 'instrument', label: 'Instrumentos' },
        ]}
        onChange={(value) => setFilter(value === 'all' ? null : (value as Content['kind']))}
      />
      {resource.loading && <Loading />}
      {me.data?.profession === 'teacher' && (
        <Action
          secondary
          selected={archived}
          title={archived ? 'Mostrar conteúdos ativos' : 'Ver meus conteúdos arquivados'}
          onPress={() => setArchived(!archived)}
        />
      )}
      {!!resource.error && <Notice error text={resource.error} />}
      {!!message && <Notice text={message} />}
      {me.data?.profession === 'teacher' && !creating && (
        <Action title="Criar conteúdo docente" onPress={() => setCreating(true)} />
      )}
      {creating && (
        <ContentEditor
          cancel={() => setCreating(false)}
          saved={async () => {
            setCreating(false);
            setMessage('Rascunho salvo. O conteúdo permanece sem publicação até a revisão.');
            await resource.reload();
          }}
        />
      )}
      {resource.data?.length === 0 && (
        <Notice text="Nenhum conteúdo disponível. Publicação aguarda revisão (D03)." />
      )}
      {!!resource.data?.length && matching?.length === 0 && (
        <Notice text="Nenhum conteúdo corresponde à busca. Experimente outro título ou tipo." />
      )}
      {matching?.map((content) => (
        <Card key={content.id}>
          <Copy heading>{content.title}</Copy>
          <Copy muted>
            {content.archived_at ? 'Arquivado · ' : ''}
            {
              {
                activity: 'Atividade',
                guidance: 'Orientação',
                instrument: 'Instrumento de avaliação',
              }[content.kind]
            }{' '}
            ·{' '}
            {content.status === 'synthetic'
              ? 'Teste sintético sem validade pedagógica'
              : content.status === 'draft'
                ? 'Rascunho: não publicado'
                : 'Publicado'}{' '}
            · versão {content.version}
          </Copy>
          <ContentDetails content={content} />
          {content.author_id === me.data?.id && (
            <Action
              secondary
              destructive={!content.archived_at}
              icon={content.archived_at ? ArchiveRestore : Archive}
              title={content.archived_at ? 'Restaurar conteúdo' : 'Arquivar conteúdo'}
              onPress={() => setConfirm(content)}
            />
          )}
          {content.author_id === me.data?.id &&
            content.status === 'draft' &&
            !content.archived_at &&
            editing !== content.id && (
              <Action
                secondary
                title={'Editar rascunho: ' + content.title}
                onPress={() => setEditing(content.id)}
              />
            )}
          {editing === content.id && (
            <ContentEditor
              key={content.id + ':' + content.version}
              initial={content}
              cancel={() => setEditing(null)}
              saved={async () => {
                setEditing(null);
                setMessage(
                  'Nova versão salva. A revisão anterior foi preservada; esta versão precisa de novo parecer.',
                );
                await resource.reload();
              }}
            />
          )}
          {!content.archived_at && (
            <ContentReviewCard
              content={content}
              canReview={!!me.data?.capabilities.review_pedagogy}
              isAuthor={content.author_id === me.data?.id}
              changed={resource.reload}
            />
          )}
          {(content.author_id === me.data?.id || me.data?.capabilities.review_pedagogy) && (
            <Action
              secondary
              expanded={history === content.id}
              title={'Histórico de versões: ' + content.title}
              onPress={() => setHistory(history === content.id ? null : content.id)}
            />
          )}
          {history === content.id && (
            <ContentRevisionHistory key={content.id + ':' + content.version} content={content} />
          )}
        </Card>
      ))}
      <Sheet
        visible={!!confirm}
        title={confirm?.archived_at ? 'Restaurar conteúdo?' : 'Arquivar conteúdo?'}
        close={() => setConfirm(null)}
      >
        <Copy>
          {confirm?.archived_at
            ? 'O conteúdo voltará à biblioteca. Publicação exige revisão da versão atual.'
            : 'O conteúdo sairá das novas atribuições. Atividades já atribuídas, respostas e histórico serão preservados.'}
        </Copy>
        <Action secondary title="Cancelar" onPress={() => setConfirm(null)} />
        <Action
          destructive={!confirm?.archived_at}
          icon={confirm?.archived_at ? ArchiveRestore : Archive}
          title={confirm?.archived_at ? 'Restaurar conteúdo' : 'Arquivar conteúdo'}
          disabled={save.busy}
          onPress={() => {
            if (confirm)
              void save.run(
                '/content/' + confirm.id + (confirm.archived_at ? '/restore' : '/archive'),
                { version: confirm.version },
                async () => {
                  setConfirm(null);
                  setEditing(null);
                  setHistory(null);
                  await resource.reload();
                },
              );
          }}
        />
        <SaveState command={save} />
      </Sheet>
    </Page>
  );
}
