import { useState } from 'react';
import { View } from 'react-native';
import { Plus, Route, Users, Pencil, BookOpen } from 'lucide-react-native';
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
import { LevelFilter } from '@/features/assessments/LevelFilter';

export function CatalogScreen({
  navigation,
  student: provided,
}: {
  navigation: Pick<ScreenProps<'Trails'>['navigation'], 'navigate'>;
  student?: Student;
}) {
  const { profession, value, update } = useWorkspace();
  const me = useResource<{ id: string }>('/me');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
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
  async function open(trail: TrailSummary, forceNew = false) {
    if (!selected) {
      setPicker(true);
      return;
    }
    const existing = enrollments.data?.filter((e) => e.trail_id === trail.id).slice(-1)[0];
    if (existing && !forceNew) {
      navigation.navigate('TrailMap', { student: selected, enrollmentId: existing.id });
      return;
    }
    await save.run<{ id: string }>(
      '/students/' + selected.id + '/trails',
      { trail_id: trail.id, version: trail.version },
      (r) => navigation.navigate('TrailMap', { student: selected, enrollmentId: r.id }),
    );
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
        <>
          <Action
            secondary
            icon={BookOpen}
            title="Biblioteca e construtor de aulas"
            onPress={() => navigation.navigate('LessonLibrary')}
          />
          <Action
            icon={Plus}
            title="Criar trilha e aulas"
            onPress={() => navigation.navigate('TrailAuthor')}
          />
        </>
      )}
      <Field label="Buscar trilhas" value={search} onChangeText={setSearch} maxLength={120} />
      <LevelFilter value={level} onChange={setLevel} />
      {catalog.loading && <Copy>Buscando trilhas…</Copy>}
      {!!catalog.error && <Notice error text={catalog.error} />}
      <LoadState resource={enrollments} />
      {catalog.items
        ?.filter((t) => !t.archived_at)
        .map((trail) => {
          const enrolled = enrollments.data?.filter((e) => e.trail_id === trail.id).slice(-1)[0];
          const available = ['published', 'synthetic'].includes(trail.status);
          return (
            <Card key={trail.id}>
              <View style={{ borderRadius: 18, overflow: 'hidden' }}>
                <Illustration
                  image={trail.cover || { builtin: trail.scenario, alt: '' }}
                  height={180}
                  cover
                />
              </View>
              <Badge
                text={
                  trail.status === 'synthetic'
                    ? 'DEMONSTRAÇÃO · SEM VALIDAÇÃO PEDAGÓGICA'
                    : trail.status === 'draft'
                      ? 'RASCUNHO DO AUTOR'
                      : 'CATÁLOGO PUBLICADO'
                }
              />
              <Copy heading>{trail.title}</Copy>
              <Copy muted>{trail.description}</Copy>
              <Copy>
                {trail.lesson_count} aulas
                {enrollments.loading
                  ? ' · buscando progresso salvo'
                  : enrolled
                    ? ' · ' +
                      enrolled.completed_lessons +
                      ' de ' +
                      enrolled.total_lessons +
                      ' concluídas'
                    : selected
                      ? ' · ainda não iniciada'
                      : ''}
              </Copy>
              <Action
                icon={Route}
                title={
                  enrolled
                    ? 'Continuar trilha'
                    : selected
                      ? 'Começar trilha'
                      : 'Escolher estudante e começar'
                }
                disabled={save.busy || !available || (!enrollments.data && !!selected)}
                onPress={() => void open(trail)}
              />
              {enrolled && enrolled.version < trail.version && (
                <Action
                  secondary
                  title={'Iniciar versão ' + trail.version + ' como novo percurso'}
                  onPress={() => setNewVersion(trail)}
                />
              )}
              {trail.author_id === me.data?.id && profession === 'teacher' && (
                <Action
                  secondary
                  icon={Pencil}
                  title="Abrir autoria desta trilha"
                  onPress={() => navigation.navigate('TrailAuthor', { trailId: trail.id })}
                />
              )}
              {profession === 'teacher' && (
                <Action
                  secondary
                  icon={Users}
                  title="Disponibilizar para turma ou estudantes"
                  onPress={() => setGroupTrail(trail)}
                />
              )}
            </Card>
          );
        })}
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
      <Sheet visible={picker} title="Quem vai explorar?" close={() => setPicker(false)}>
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
              if (provided) navigation.navigate('Trail', { student: s });
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
