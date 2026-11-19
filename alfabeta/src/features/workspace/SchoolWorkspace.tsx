import { useState } from 'react';
import { View } from 'react-native';
import { Plus, School, Users, FileChartColumn, UserPlus } from 'lucide-react-native';
import { Page, Card, Copy, Action, Field } from '@/shared/ui';
import { ScreenTitle, ShortcutGrid } from '@/shared/ui/presentation';
import { MenuRow, Pills, Badge } from '@/shared/ui/learning';
import { Sheet } from '@/shared/ui/Sheet';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { useResource, useCommand } from '@/shared/data/hooks';
import { usePaged, useDebounced } from '@/shared/data/paged';
import { useWorkspace } from '@/app/Workspace';
import type { ScreenProps } from '@/app/routes';
import type { Student } from '@/shared/contracts';
import { SchoolTeam } from './SchoolTeam';
import type { School as SchoolType, Room } from './ContextPicker';

export function SchoolWorkspace({ navigation }: Pick<ScreenProps<'Schools'>, 'navigation'>) {
  const { value, update } = useWorkspace();
  const schools = useResource<SchoolType[]>('/schools');
  const rooms = useResource<Room[]>('/classrooms');
  const [form, setForm] = useState<'school' | 'room' | 'enroll' | null>(null);
  const [schoolId, setSchoolId] = useState('');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const students = usePaged<Student>(
    form === 'enroll' ? '/students-page?q=' + encodeURIComponent(query) : null,
  );
  const [selected, setSelected] = useState<Room | null>(null);
  const save = useCommand();
  const school = schools.data?.find((s) => s.id === value.schoolId);
  async function saved() {
    setForm(null);
    setName('');
    await schools.reload();
    await rooms.reload();
  }
  function start(kind: 'school' | 'room') {
    setName('');
    setSchoolId(value.schoolId);
    setForm(kind);
  }
  return (
    <Page>
      <ScreenTitle
        title="Escolas e turmas"
        subtitle="Cada grupo, um novo universo."
        action={
          <Action
            secondary
            icon={Plus}
            title="Escola"
            accessibilityLabel="Adicionar escola"
            onPress={() => start('school')}
          />
        }
      />
      <LoadState resource={schools} />
      {!!value.schoolId && !school && !schools.loading && (
        <Action
          secondary
          title="Mostrar minhas escolas"
          onPress={() => update({ schoolId: '', classroomId: '', studentId: '' })}
        />
      )}
      {!school ? (
        <>
          {schools.data?.map((s) => (
            <MenuRow
              key={s.id}
              icon={School}
              title={s.name}
              detail={s.can_manage ? 'Gestão e turmas da escola' : 'Suas turmas autorizadas'}
              onPress={() => update({ schoolId: s.id, classroomId: '', studentId: '' })}
            />
          ))}
          {schools.data?.length === 0 && (
            <Card>
              <Copy heading>Sua primeira escola</Copy>
              <Copy muted>Organize os grupos de aprendizagem em um só lugar.</Copy>
              <Action icon={Plus} title="Adicionar escola" onPress={() => start('school')} />
            </Card>
          )}
        </>
      ) : (
        <>
          <View style={{ gap: 10 }}>
            <Badge text={school.name} />
            <Action
              quiet
              title="Trocar escola"
              onPress={() => update({ schoolId: '', classroomId: '', studentId: '' })}
            />
          </View>
          <ShortcutGrid
            items={[
              {
                icon: Users,
                title: 'Estudantes',
                detail: 'Cadastros e jornadas autorizadas',
                onPress: () => navigation.navigate('Children'),
              },
              {
                icon: FileChartColumn,
                title: 'Relatórios',
                detail: 'Panorama deste contexto',
                onPress: () => navigation.navigate('Reports'),
              },
            ]}
          />
          {school.can_manage && (
            <>
              <SchoolTeam schoolId={school.id} />
              <Action icon={Plus} title="Criar turma" onPress={() => start('room')} />
            </>
          )}
          <LoadState resource={rooms} />
          {rooms.data
            ?.filter((r) => r.school_id === school.id)
            .map((room) => (
              <MenuRow
                key={room.id}
                icon={Users}
                title={room.name}
                detail={
                  value.classroomId === room.id
                    ? 'Turma selecionada'
                    : 'Estudantes, matrícula e relatório'
                }
                onPress={() => setSelected(room)}
              />
            ))}
          {rooms.data?.filter((r) => r.school_id === school.id).length === 0 && (
            <Copy muted>Ainda não há turmas disponíveis nesta escola.</Copy>
          )}
        </>
      )}
      <Sheet
        visible={!!selected && !form}
        title={selected?.name || 'Turma'}
        close={() => setSelected(null)}
      >
        <MenuRow
          icon={Users}
          title="Abrir estudantes da turma"
          detail="Somente vínculos autorizados"
          onPress={() => {
            if (!selected) return;
            update({ schoolId: selected.school_id, classroomId: selected.id, studentId: '' });
            setSelected(null);
            navigation.navigate('Children');
          }}
        />
        <MenuRow
          icon={UserPlus}
          title="Matricular estudante"
          detail="Escolha entre seus vínculos ativos"
          onPress={() => {
            setSearch('');
            setForm('enroll');
          }}
        />
        <MenuRow
          icon={FileChartColumn}
          title="Relatório da turma"
          onPress={() => {
            if (!selected) return;
            const room = selected;
            setSelected(null);
            navigation.navigate('Collective', { classroomId: room.id, title: room.name });
          }}
        />
      </Sheet>
      <Sheet
        visible={form === 'school' || form === 'room'}
        title={form === 'school' ? 'Nova escola' : 'Nova turma'}
        close={() => {
          if (!save.busy) setForm(null);
        }}
        footer={
          <Action
            title={save.busy ? 'Salvando…' : form === 'school' ? 'Salvar escola' : 'Salvar turma'}
            disabled={save.busy || name.trim().length < 2 || (form === 'room' && !schoolId)}
            onPress={() =>
              void save.run(
                form === 'school' ? '/schools' : '/classrooms',
                form === 'school'
                  ? { name: name.trim() }
                  : { name: name.trim(), school_id: schoolId },
                saved,
              )
            }
          />
        }
      >
        {form === 'room' && (
          <Pills
            value={schoolId}
            onChange={setSchoolId}
            options={(schools.data || [])
              .filter((s) => s.can_manage)
              .map((s) => ({ value: s.id, label: s.name }))}
          />
        )}
        <Field
          label={form === 'school' ? 'Nome da escola' : 'Nome da turma'}
          value={name}
          onChangeText={setName}
          maxLength={form === 'school' ? 120 : 100}
        />
        <SaveState command={save} />
      </Sheet>
      <Sheet
        visible={form === 'enroll'}
        title={'Matricular · ' + (selected?.name || 'turma')}
        close={() => {
          if (!save.busy) setForm(null);
        }}
      >
        <Field label="Buscar estudante" value={search} onChangeText={setSearch} maxLength={120} />
        <Copy muted size="caption">
          Matrícula organiza o grupo. Ela não concede acesso a outros adultos.
        </Copy>
        {students.items.map((s) => (
          <Action
            key={s.id}
            secondary
            title={'Matricular ' + s.name}
            disabled={save.busy}
            onPress={() => {
              if (!selected) return;
              void save.run(
                '/classrooms/' + selected.id + '/enrollments',
                { student_id: s.id },
                () => {
                  update({ schoolId: selected.school_id, classroomId: selected.id, studentId: '' });
                  setForm(null);
                  setSelected(null);
                  navigation.navigate('Children');
                },
              );
            }}
          />
        ))}
        {students.loading && <Copy>Buscando estudantes…</Copy>}
        {!students.loading && students.items.length === 0 && (
          <Copy>Nenhum estudante encontrado entre seus vínculos.</Copy>
        )}
        {students.next != null && (
          <Action
            secondary
            title="Carregar mais estudantes"
            onPress={students.more}
            disabled={students.loading}
          />
        )}
        {!!students.error && <Copy>{students.error}</Copy>}
        <SaveState command={save} />
      </Sheet>
    </Page>
  );
}
