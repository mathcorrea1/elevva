import { useState } from 'react';
import { View, FlatList } from 'react-native';
import {
  Plus,
  Share2,
  Pencil,
  Copy as CopyIcon,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react-native';
import { Action, Card, Copy, Field, Notice } from '@/shared/ui';
import { Eyebrow, Badge, Pills, Disclosure } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useCommand } from '@/shared/data/hooks';
import { usePaged, useDebounced } from '@/shared/data/paged';
import { SaveState } from '@/shared/ui/ResourceState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Illustration } from '@/features/trails/Illustration';
import type { ScreenProps } from '@/app/routes';
import type { Lesson } from './types';
import { AssignSheet } from './AssignSheet';
import { PreviewSheet } from './PreviewSheet';
import { LevelFilter } from '@/features/assessments/LevelFilter';
import { IconAction } from '@/shared/ui/IconAction';
export function LessonLibraryScreen({ route, navigation }: ScreenProps<'LessonLibrary'>) {
  const { colors } = useTheme();
  const save = useCommand();
  const [scope, setScope] = useState('mine');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [filters, setFilters] = useState(false);
  const query = useDebounced(search);
  const lessons = usePaged<Lesson>(
    '/lessons?scope=' +
      scope +
      '&q=' +
      encodeURIComponent(query) +
      (level ? '&level=' + level : ''),
  );
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [assign, setAssign] = useState<Lesson | null>(null);
  const [sharing, setSharing] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [canCopy, setCanCopy] = useState(true);
  const [redistribute, setRedistribute] = useState(false);
  const [preview, setPreview] = useState<Lesson | null>(null);
  const outgoing = usePaged<{
    id: string;
    recipient_id: string;
    recipient_name?: string;
    status: string;
    can_copy: boolean;
    can_redistribute: boolean;
  }>(
    selected?.permissions.edit || selected?.permissions.redistribute
      ? '/lessons/' + selected.id + '/shares'
      : null,
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ width: '100%', maxWidth: 1040, alignSelf: 'center', padding: 20, gap: 14 }}>
        <Eyebrow>SEU ATELIÊ DE DESCOBERTAS</Eyebrow>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Copy heading headingLevel={1} size="display">
            Aulas
          </Copy>
          <Action
            icon={Plus}
            title="Nova aula"
            onPress={() => navigation.navigate('LessonBuilder')}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Field label="Buscar aulas" value={search} onChangeText={setSearch} maxLength={120} />
          </View>
          <IconAction
            icon={SlidersHorizontal}
            label={level ? 'Filtros de aulas: um ativo' : 'Filtrar aulas'}
            onPress={() => setFilters(true)}
          />
        </View>
        <Pills
          value={scope}
          options={[
            { value: 'mine', label: 'Minhas' },
            { value: 'shared', label: 'Equipe' },
            { value: 'received', label: 'Convites' },
            { value: 'public', label: 'Explorar' },
          ]}
          onChange={setScope}
        />
        <Copy muted size="caption">
          {lessons.total} aulas neste filtro · versões preservadas e reutilizáveis
        </Copy>
        <SaveState command={save} />
      </View>
      <FlatList
        data={lessons.items}
        keyExtractor={(l) => l.revision_id || l.id}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 0,
          gap: 16,
          width: '100%',
          maxWidth: 1040,
          alignSelf: 'center',
        }}
        renderItem={({ item: l }) => (
          <Card>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <View style={{ width: 88 }}>
                <Illustration image={l.cover || { builtin: 'sprout', alt: '' }} height={92} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Copy heading>{l.title}</Copy>
                <Copy muted size="caption">
                  {l.author_name || l.author_id} · versão {l.version}
                  {l.origin_content_id ? ' · cópia de uma aula' : ''}
                </Copy>
                <Badge
                  text={
                    scope === 'received'
                      ? 'CONVITE DE CONTEÚDO'
                      : l.status === 'synthetic'
                        ? 'DEMONSTRAÇÃO TÉCNICA'
                        : l.status === 'draft'
                          ? 'RASCUNHO'
                          : 'PUBLICADA'
                  }
                />
              </View>
            </View>
            <Copy muted>{l.description}</Copy>
            {scope === 'received' ? (
              <Action
                title="Aceitar aula compartilhada"
                disabled={save.busy}
                onPress={() =>
                  void save.run('/lesson-shares/' + l.share_id + '/accept', {}, lessons.reload)
                }
              />
            ) : (
              <Action
                secondary
                icon={BookOpen}
                title="Usar e organizar aula"
                onPress={() => {
                  setSelected(l);
                  setSharing(false);
                }}
              />
            )}
          </Card>
        )}
        ListEmptyComponent={
          lessons.loading ? (
            <Skeleton />
          ) : (
            <Notice
              text={
                lessons.error ||
                'Nenhuma aula neste filtro. Crie uma aula ou aceite um convite de outro professor.'
              }
              error={!!lessons.error}
            />
          )
        }
        ListFooterComponent={
          <View style={{ gap: 12 }}>
            {lessons.loading && !!lessons.items.length && <Skeleton />}
            {lessons.next !== null && (
              <Action
                secondary
                title="Carregar mais aulas"
                disabled={lessons.loading}
                onPress={() => void lessons.more()}
              />
            )}
            {!!lessons.error && (
              <Action secondary title="Tentar novamente" onPress={() => void lessons.reload()} />
            )}
          </View>
        }
      />
      <Sheet visible={!!selected} title={selected?.title || 'Aula'} close={() => setSelected(null)}>
        {selected && (
          <>
            <Copy muted>
              Versão {selected.version} · autor {selected.author_name || selected.author_id}
            </Copy>
            <Copy>
              Compartilhar conteúdo não compartilha estudantes, vínculos ou relatórios. A cópia
              preserva a origem e cria um rascunho independente.
            </Copy>
            <Action
              secondary
              title="Visualizar telas desta versão"
              onPress={() => {
                setPreview(selected);
                setSelected(null);
              }}
            />
            {selected.status !== 'draft' && (
              <Action
                title="Disponibilizar para estudantes e turmas"
                onPress={() => {
                  setAssign(selected);
                  setSelected(null);
                }}
              />
            )}
            {selected.permissions?.edit && (
              <Action
                secondary
                icon={Pencil}
                title="Editar em nova versão"
                onPress={() => {
                  const id = selected.id;
                  setSelected(null);
                  navigation.navigate('LessonBuilder', { lessonId: id });
                }}
              />
            )}
            {selected.permissions?.copy && (
              <Action
                secondary
                icon={CopyIcon}
                title="Duplicar para personalizar"
                disabled={save.busy}
                onPress={() =>
                  void save.run<Lesson>(
                    '/lessons/' + selected.id + '/copy',
                    { version: selected.version },
                    (l) => {
                      setSelected(null);
                      navigation.navigate('LessonBuilder', { lessonId: l.id });
                    },
                  )
                }
              />
            )}
            {selected.permissions?.redistribute && selected.status !== 'draft' && (
              <Action
                secondary
                icon={Share2}
                title="Compartilhar com outro professor"
                onPress={() => setSharing(!sharing)}
              />
            )}
            {sharing && (
              <>
                <Field
                  label="Identificador da conta do professor"
                  value={recipient}
                  onChangeText={setRecipient}
                  maxLength={128}
                  autoCapitalize="none"
                />
                <Copy muted>
                  O professor encontra esse código no próprio Perfil. Ele precisará aceitar a aula
                  na aba Convites.
                </Copy>
                <Action
                  secondary
                  selected={canCopy}
                  title={'Permitir cópia: ' + (canCopy ? 'sim' : 'não')}
                  onPress={() => setCanCopy(!canCopy)}
                />
                <Action
                  secondary
                  selected={redistribute}
                  title={'Permitir redistribuição: ' + (redistribute ? 'sim' : 'não')}
                  onPress={() => setRedistribute(!redistribute)}
                />
                <Action
                  title="Enviar convite de aula"
                  disabled={!recipient.trim() || save.busy}
                  onPress={() =>
                    void save.run(
                      '/lessons/' + selected.id + '/shares',
                      {
                        revision_id: selected.revision_id,
                        recipient_id: recipient,
                        can_copy: canCopy,
                        can_redistribute: redistribute,
                      },
                      () => {
                        setSharing(false);
                        setRecipient('');
                      },
                    )
                  }
                />
              </>
            )}
            <SaveState command={save} />
            {!!outgoing.total && (
              <Disclosure title="Compartilhamentos enviados">
                {outgoing.items.map((s) => (
                  <View key={s.id} style={{ gap: 8 }}>
                    <Copy>
                      {s.recipient_name || s.recipient_id} ·{' '}
                      {s.status === 'accepted'
                        ? 'Aceito'
                        : s.status === 'revoked'
                          ? 'Revogado'
                          : 'Aguardando aceite'}
                    </Copy>
                    {s.status !== 'revoked' && (
                      <Action
                        secondary
                        destructive
                        title="Revogar compartilhamento de conteúdo"
                        disabled={save.busy}
                        onPress={() =>
                          void save.run('/lesson-shares/' + s.id + '/revoke', {}, outgoing.reload)
                        }
                      />
                    )}
                  </View>
                ))}
                {outgoing.next !== null && (
                  <Action
                    secondary
                    title="Ver mais compartilhamentos"
                    disabled={outgoing.loading}
                    onPress={() => void outgoing.more()}
                  />
                )}
                <Copy muted>
                  A revogação impede novos usos dessa versão recebida. Atribuições anteriores e
                  cópias já autorizadas preservam seus registros e limites originais.
                </Copy>
              </Disclosure>
            )}
          </>
        )}
      </Sheet>
      <Sheet
        visible={filters}
        title="Encontrar a próxima aula"
        close={() => setFilters(false)}
        footer={<Action title="Ver aulas" onPress={() => setFilters(false)} />}
      >
        <Copy heading>Nível pedagógico</Copy>
        <LevelFilter value={level} onChange={setLevel} />
        <Copy muted>O filtro ajuda a localizar conteúdos. A escolha da aula cabe ao adulto.</Copy>
        <Action
          secondary
          icon={Sparkles}
          title="Criação assistida por IA"
          onPress={() => {
            setFilters(false);
            navigation.navigate('LessonAI');
          }}
        />
      </Sheet>
      {assign && (
        <AssignSheet
          key={assign.revision_id}
          lesson={assign}
          close={() => setAssign(null)}
          studentId={route.params?.studentId}
        />
      )}
      {!!preview && (
        <PreviewSheet key={preview.revision_id} lesson={preview} close={() => setPreview(null)} />
      )}
    </View>
  );
}
