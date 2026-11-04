import React, { useState } from 'react';
import { Page, Card, Copy, Field, Action, Notice, Loading } from '@/shared/ui';
import { useCommand, useResource } from '@/features/learning/hooks';
import type { Student, Report } from '@/shared/contracts';
import { Disclosure, Eyebrow, Badge } from '@/shared/ui/learning';

export { LibraryScreen } from './LibraryScreen';

type School = { id: string; name: string };
type Room = { id: string; name: string; school_id: string };
type Collective = { students: Report[]; note: string };
export function ClassroomsScreen() {
  const schools = useResource<School[]>('/schools');
  const rooms = useResource<Room[]>('/classrooms');
  const children = useResource<Student[]>('/students');
  const save = useCommand();
  const [schoolName, setSchoolName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [school, setSchool] = useState('');
  const [selected, setSelected] = useState<Room | null>(null);
  const [collective, setCollective] = useState<Collective | null>(null);
  return (
    <Page>
      <Eyebrow>APRENDER TAMBÉM É COMPARTILHAR</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Minhas turmas
      </Copy>
      <Copy muted>Organize os grupos e acompanhe os estudantes com vínculo autorizado.</Copy>
      <Disclosure title="Adicionar escola">
        <Card>
          <Copy heading>Escola</Copy>
          <Field
            label="Nome da escola"
            value={schoolName}
            onChangeText={setSchoolName}
            maxLength={120}
          />
          <Action
            title="Salvar escola"
            disabled={!schoolName.trim() || save.busy}
            onPress={() =>
              void save.run('/schools', { name: schoolName }, async () => {
                setSchoolName('');
                await schools.reload();
              })
            }
          />
        </Card>
      </Disclosure>
      <Disclosure title="Criar turma">
        <Card>
          <Copy heading>Nova turma</Copy>
          {!!schools.loading && <Loading />}
          {schools.data?.map((s) => (
            <Action
              key={s.id}
              secondary={school !== s.id}
              title={(school === s.id ? 'Selecionada: ' : '') + s.name}
              onPress={() => setSchool(s.id)}
            />
          ))}
          <Field
            label="Nome da turma"
            value={roomName}
            onChangeText={setRoomName}
            maxLength={100}
          />
          <Action
            title="Salvar turma"
            disabled={!school || !roomName.trim() || save.busy}
            onPress={() =>
              void save.run('/classrooms', { school_id: school, name: roomName }, async () => {
                setRoomName('');
                await rooms.reload();
              })
            }
          />
        </Card>
      </Disclosure>
      {rooms.data?.map((r) => (
        <Card key={r.id}>
          <Copy heading>{r.name}</Copy>
          <Badge
            text={schools.data?.find((s) => s.id === r.school_id)?.name || 'Contexto escolar'}
          />
          <Action
            secondary
            title="Abrir turma"
            onPress={() => {
              setSelected(r);
              setCollective(null);
            }}
          />
        </Card>
      ))}
      {!!selected && (
        <Card>
          <Copy heading>{selected.name}</Copy>
          <Copy>Matricular estudante com vínculo:</Copy>
          {children.data?.map((c) => (
            <Action
              key={c.id}
              secondary
              title={'Matricular ' + c.name}
              disabled={save.busy}
              onPress={() =>
                void save.run('/classrooms/' + selected.id + '/enrollments', { student_id: c.id })
              }
            />
          ))}
          <CollectiveLoader room={selected.id} onResult={setCollective} />
          {!!collective && (
            <>
              <Copy>{collective.note}</Copy>
              {collective.students.map((r) => (
                <Copy key={r.student_id}>
                  {children.data?.find((s) => s.id === r.student_id)?.name ||
                    'Estudante autorizado'}
                  : {r.completed_tasks} tarefas concluídas, {r.observations} observações.
                </Copy>
              ))}
            </>
          )}
        </Card>
      )}
      {[schools.error, rooms.error, children.error, save.error].filter(Boolean).map((e, i) => (
        <Notice key={i} error text={e} />
      ))}
      {!!save.message && <Notice text={save.message} />}
    </Page>
  );
}
function CollectiveLoader({ room, onResult }: { room: string; onResult: (r: Collective) => void }) {
  const resource = useResource<Collective>('/classrooms/' + room + '/report');
  return (
    <>
      <Action
        secondary
        title="Exibir relatório coletivo"
        disabled={resource.loading}
        onPress={() => {
          if (resource.data) onResult(resource.data);
        }}
      />
      {!!resource.error && <Notice error text={resource.error} />}
    </>
  );
}
