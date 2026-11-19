import { useState, useRef } from 'react';
import { View, Pressable } from 'react-native';
import {
  Plus,
  Route,
  Users,
  Pencil,
  BookOpen,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react-native';
import { Page, Card, Copy, Action, Notice, Field } from '@/shared/ui';
import { usePaged, useDebounced } from '@/shared/data/paged';
import { Eyebrow, Badge, MenuRow } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { useWorkspace } from '@/app/Workspace';
import type { ScreenProps } from '@/app/routes';
import type { Student } from '@/shared/contracts';
import { Illustration } from './Illustration';
import type { TrailSummary, Enrollment } from './types';
import { AssignSheet } from '@/features/lessons/AssignSheet';
import { repository } from '@/shared/http/repository';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { IconAction } from '@/shared/ui/IconAction';
import { LevelFilter } from '@/features/assessments/LevelFilter';

export function CatalogScreen({
  navigation,
  student: provided,
}: {
  navigation: Pick<ScreenProps<'Trails'>['navigation'], 'navigate'>;
  student?: Student;
}) {
  const { profession, value, update } = useWorkspace();
  const { colors } = useTheme();
  const [pendingTrail, setPendingTrail] = useState<TrailSummary | null>(null);
  const [tools, setTools] = useState<TrailSummary | null>(null);
  const [focusedTrail, setFocusedTrail] = useState('');
  const [openError, setOpenError] = useState('');
  const opening = useRef(false);
  const me = useResource<{ id: string }>('/me');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [filters, setFilters] = useState(false);
  const query = useDebounced(search);
  const catalog = usePaged<TrailSummary>(
    '/trails-page?q=' + encodeURIComponent(query) + (level ? '&level=' + level : ''),
  );
  const save = useCommand();
  const [picker, setPicker] = useState(false);
  const [newVersion, setNewVersion] = useState<TrailSummary | null>(null);
  const [groupTrail, setGroupTrail] = useState<TrailSummary | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const studentQuery = useDebounced(studentSearch);
  const students = usePaged<Student>(
    picker ? '/students-page?q=' + encodeURIComponent(studentQuery) : null,
  );
  const selectedResource = useResource<Student>(
    !provided && value.studentId ? '/students/' + value.studentId : null,
  );
  const selected = provided || selectedResource.data;
  const enrollments = useResource<Enrollment[]>(
    selected ? '/students/' + selected.id + '/trails' : null,
  );
  async function open(trail: TrailSummary, forceNew = false, target = selected) {
    if (!target) {
      setPendingTrail(trail);
      setPicker(true);
      return;
    }
    if (opening.current || save.busy) return;
    opening.current = true;
    setOpenError('');
    try {
      const saved =
        target.id === selected?.id && enrollments.data
          ? enrollments.data
          : await repository.get<Enrollment[]>('/students/' + target.id + '/trails');
      const existing = saved
        .filter((e) => e.trail_id === trail.id)
        .sort((a, b) => b.version - a.version)[0];
      if (existing && !forceNew) {
        navigation.navigate('TrailMap', { student: target, enrollmentId: existing.id });
        return;
      }
      await save.run<{ id: string }>(
        '/students/' + target.id + '/trails',
        { trail_id: trail.id, version: trail.version },
        (r) => navigation.navigate('TrailMap', { student: target, enrollmentId: r.id }),
      );
    } catch (error) {
      setOpenError((error as Error).message);
    } finally {
      opening.current = false;
    }
  }
  return (
    <Page>
      <Eyebrow>UM MUNDO DE DESCOBERTAS</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Qual caminho{'\n'}vamos explorar?
      </Copy>
      <Copy muted>Cada trilha tem seu cenário e suas aulas. Escolha uma para conhecer o mapa.</Copy>
      <Action
        secondary
        icon={Users}
        title={selected ? 'Acompanhando ' + selected.name : 'Escolher estudante para acompanhar'}
        onPress={() => setPicker(true)}
      />
      {profession === 'teacher' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Action
              secondary
              icon={BookOpen}
              title="Aulas"
              accessibilityLabel="Minhas aulas"
              onPress={() => navigation.navigate('LessonLibrary')}
            />
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Action
              icon={Plus}
              title="Criar trilha"
              onPress={() => navigation.navigate('TrailAuthor')}
            />
          </View>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Field label="Buscar trilhas" value={search} onChangeText={setSearch} maxLength={120} />
        </View>
        <IconAction
          icon={SlidersHorizontal}
          label={level ? 'Filtros de trilhas: um ativo' : 'Filtrar trilhas'}
          onPress={() => setFilters(true)}
        />
      </View>
      <Sheet
        visible={filters}
        title="Encontrar seu caminho"
        close={() => setFilters(false)}
        footer={<Action title="Ver trilhas" onPress={() => setFilters(false)} />}
      >
        <Copy heading>Nível pedagógico</Copy>
        <LevelFilter value={level} onChange={setLevel} />
        <Copy muted>
          Escolha uma trilha com orientação do adulto, respeitando os apoios e o ritmo do estudante.
        </Copy>
      </Sheet>
      {catalog.loading && <Copy>Buscando trilhas…</Copy>}
      {!!catalog.error && <Notice error text={catalog.error} />}
      <LoadState resource={enrollments} />
      {catalog.items
        ?.filter((t) => !t.archived_at)
        .map((trail) => {
          const enrolled = enrollments.data
            ?.filter((e) => e.trail_id === trail.id)
            .sort((a, b) => b.version - a.version)[0];
          const available = ['published', 'synthetic'].includes(trail.status);
          return (
            <Card key={trail.id}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Badge
                  text={
                    trail.status === 'synthetic'
                      ? 'DEMONSTRAÇÃO'
                      : trail.status === 'draft'
                        ? 'RASCUNHO'
                        : 'PUBLICADA'
                  }
                />
                {profession === 'teacher' && (
                  <IconAction
                    label={'Opções da trilha ' + trail.title}
                    icon={MoreHorizontal}
                    onPress={() => setTools(trail)}
                  />
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={'Explorar trilha ' + trail.title}
                accessibilityState={{ disabled: !available || save.busy }}
                disabled={!available || save.busy}
                onPress={() => void open(trail)}
                onFocus={() => setFocusedTrail(trail.id)}
                onBlur={() => setFocusedTrail('')}
                style={{
                  gap: 12,
                  borderRadius: 18,
                  borderWidth: 2,
                  borderColor: focusedTrail === trail.id ? colors.focus : 'transparent',
                }}
              >
                <View style={{ borderRadius: 18, overflow: 'hidden' }}>
                  <Illustration
                    image={trail.cover || { builtin: trail.scenario, alt: '' }}
                    height={180}
                    cover
                  />
                </View>
                <Copy heading>{trail.title}</Copy>
                <Copy muted>{trail.description}</Copy>
                <Copy>
                  {trail.lesson_count} aulas
                  {enrolled
                    ? ' · ' +
                      enrolled.completed_lessons +
                      ' de ' +
                      enrolled.total_lessons +
                      ' concluídas'
                    : ''}
                </Copy>
              </Pressable>
              <Action
                icon={Route}
                title={
                  enrolled ? 'Continuar trilha' : selected ? 'Começar trilha' : 'Explorar trilha'
                }
                disabled={save.busy || !available}
                onPress={() => void open(trail)}
              />
              {enrolled && enrolled.version < trail.version && (
                <Action
                  secondary
                  title={'Conhecer versão ' + trail.version}
                  onPress={() => setNewVersion(trail)}
                />
              )}
            </Card>
          );
        })}
      {!!openError && <Notice error text={openError} />}
      <Sheet
        visible={!!tools}
        title={tools?.title || 'Opções da trilha'}
        close={() => setTools(null)}
      >
        {tools?.author_id === me.data?.id && (
          <Action
            secondary
            icon={Pencil}
            title="Editar trilha"
            onPress={() => {
              if (!tools) return;
              const trail = tools;
              setTools(null);
              navigation.navigate('TrailAuthor', { trailId: trail.id });
            }}
          />
        )}
        <Action
          secondary
          icon={Users}
          title="Atribuir à turma ou estudantes"
          onPress={() => {
            setGroupTrail(tools);
            setTools(null);
          }}
        />
      </Sheet>
      {enrollments.data
        ?.filter((e) => !catalog.items.some((t) => t.id === e.trail_id && !t.archived_at))
        .map((e) => (
          <Card key={e.id}>
            <Illustration image={e.cover} height={140} cover />
            <Copy heading>{e.title}</Copy>
            <Copy muted>Versão {e.version} já atribuída. Seu histórico permanece disponível.</Copy>
            <Action
              title="Abrir meu percurso salvo"
              onPress={() => {
                if (selected)
                  navigation.navigate('TrailMap', { student: selected, enrollmentId: e.id });
              }}
            />
          </Card>
        ))}
      {catalog.next !== null && (
        <Action
          secondary
          title="Carregar mais trilhas"
          disabled={catalog.loading}
          onPress={() => void catalog.more()}
        />
      )}
      {!catalog.loading && catalog.items.length === 0 && (
        <Notice text="O catálogo ainda não tem trilhas disponíveis. Um professor pode preparar uma trilha para revisão." />
      )}
      {selected && (
        <>
          <MenuRow
            icon={BookOpen}
            title="Aulas disponibilizadas"
            detail="Continuar aulas e atividades criadas pelo professor"
            onPress={() => navigation.navigate('AssignedLessons', { student: selected })}
          />
          <MenuRow
            icon={Route}
            title="Atividades atribuídas anteriormente"
            detail="Conserva os registros anteriores à organização em trilhas"
            onPress={() => navigation.navigate('LegacyTrail', { student: selected })}
          />
        </>
      )}
      <SaveState command={save} />
      {groupTrail && (
        <AssignSheet
          key={groupTrail.id}
          trail
          lesson={groupTrail}
          close={() => {
            setGroupTrail(null);
            void enrollments.reload();
          }}
        />
      )}
      <Sheet visible={!!newVersion} title="Iniciar nova versão?" close={() => setNewVersion(null)}>
        <Copy>
          O percurso anterior e as respostas serão preservados. A nova versão começa sem conclusões
          anteriores.
        </Copy>
        <Action secondary title="Cancelar" onPress={() => setNewVersion(null)} />
        <Action
          title="Criar novo percurso desta versão"
          disabled={save.busy}
          onPress={() => {
            if (newVersion) {
              const trail = newVersion;
              setNewVersion(null);
              void open(trail, true);
            }
          }}
        />
      </Sheet>
      <Sheet
        visible={picker}
        title="Quem vai explorar?"
        close={() => {
          setPicker(false);
          setPendingTrail(null);
        }}
      >
        <Field
          label="Buscar estudante para acompanhar"
          value={studentSearch}
          onChangeText={setStudentSearch}
          maxLength={120}
        />
        {students.loading && <Copy>Buscando estudantes…</Copy>}
        {!!students.error && <Notice error text={students.error} />}
        {students.items.map((s) => (
          <Action
            key={s.id}
            secondary
            selected={s.id === selected?.id}
            title={s.name}
            onPress={() => {
              update({ studentId: s.id });
              setPicker(false);
              if (pendingTrail) {
                const trail = pendingTrail;
                setPendingTrail(null);
                void open(trail, false, s);
              } else if (provided) navigation.navigate('Trail', { student: s });
            }}
          />
        ))}
        {students.next !== null && (
          <Action
            secondary
            title="Carregar mais estudantes"
            disabled={students.loading}
            onPress={() => void students.more()}
          />
        )}
        {!students.loading && students.items.length === 0 && (
          <Copy>Cadastre um estudante ou aceite um convite para acompanhar uma jornada.</Copy>
        )}
      </Sheet>
    </Page>
  );
}
export function TrailsCatalog(p: ScreenProps<'Trails'>) {
  return <CatalogScreen navigation={p.navigation} />;
}
export function StudentCatalog(p: ScreenProps<'Trail'>) {
  return <CatalogScreen navigation={p.navigation} student={p.route.params.student} />;
}
