import { useState } from 'react';
import { Sheet } from '@/shared/ui/Sheet';
import { Action, Copy, Field, Notice } from '@/shared/ui';
import { Pills } from '@/shared/ui/learning';
import { useCommand, useResource } from '@/shared/data/hooks';
import { usePaged, useDebounced } from '@/shared/data/paged';
import { SaveState, LoadState } from '@/shared/ui/ResourceState';
import type { Student } from '@/shared/contracts';
import type { School, Room } from '@/features/workspace/ContextPicker';
import type { Lesson } from './types';
export function AssignSheet({
  lesson,
  close,
  studentId,
  trail = false,
}: {
  lesson: (Pick<Lesson, 'id' | 'title' | 'version'> & { revision_id?: string }) | null;
  close: () => void;
  studentId?: string;
  trail?: boolean;
}) {
  const [kind, setKind] = useState('students');
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const students = usePaged<Student>(
    lesson && kind === 'students' ? '/students-page?q=' + encodeURIComponent(q) : null,
  );
  const schools = useResource<School[]>(lesson && kind === 'schools' ? '/schools' : null);
  const rooms = useResource<Room[]>(lesson && kind === 'classes' ? '/classrooms' : null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(studentId ? [studentId] : []);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const save = useCommand();
  const count = selectedStudents.length + selectedClasses.length + selectedSchools.length;
  function toggle(id: string, values: string[], set: (v: string[]) => void) {
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  }
  return (
    <Sheet
      visible={!!lesson}
      title={trail ? 'Disponibilizar trilha' : 'Disponibilizar aula'}
      close={close}
      footer={
        <Action
          title={
            save.busy
              ? 'Disponibilizando…'
              : trail
                ? 'Atribuir trilha aos selecionados'
                : 'Atribuir aula aos selecionados'
          }
          disabled={!count || save.busy}
          onPress={() =>
            void save.run(
              (trail ? '/trails/' : '/lessons/') + lesson?.id + '/assign',
              {
                ...(trail ? { version: lesson?.version } : { revision_id: lesson?.revision_id }),
                student_ids: selectedStudents,
                classroom_ids: selectedClasses,
                school_ids: selectedSchools,
              },
              close,
            )
          }
        />
      }
    >
      <Copy heading>{lesson?.title}</Copy>
      <Copy muted>
        Versão {lesson?.version}. Apenas estudantes com vínculo ativo recebem a aula. Matrícula e
        escola não concedem acesso por si.
      </Copy>
      <Pills
        value={kind}
        options={[
          { value: 'students', label: 'Estudantes' },
          { value: 'classes', label: 'Turmas' },
          { value: 'schools', label: 'Escolas' },
        ]}
        onChange={setKind}
      />
      <Copy>{count} destinatário(s) ou grupo(s) selecionado(s)</Copy>
      <SaveState command={save} />
      {kind === 'students' ? (
        <>
          <Field
            label="Buscar estudantes autorizados"
            value={search}
            onChangeText={setSearch}
            maxLength={120}
          />
          {students.loading && <Copy>Buscando estudantes…</Copy>}
          {!!students.error && <Notice error text={students.error} />}
          {students.items.map((s) => (
            <Action
              key={s.id}
              secondary
              selected={selectedStudents.includes(s.id)}
              title={(selectedStudents.includes(s.id) ? '✓ ' : '') + s.name}
              onPress={() => toggle(s.id, selectedStudents, setSelectedStudents)}
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
          {!students.loading && !students.items.length && (
            <Copy>Nenhum estudante corresponde à busca.</Copy>
          )}
        </>
      ) : kind === 'classes' ? (
        <>
          <LoadState resource={rooms} />
          {rooms.data?.map((r) => (
            <Action
              key={r.id}
              secondary
              selected={selectedClasses.includes(r.id)}
              title={(selectedClasses.includes(r.id) ? '✓ ' : '') + r.name}
              onPress={() => toggle(r.id, selectedClasses, setSelectedClasses)}
            />
          ))}
        </>
      ) : (
        <>
          <LoadState resource={schools} />
          {schools.data?.map((s) => (
            <Action
              key={s.id}
              secondary
              selected={selectedSchools.includes(s.id)}
              title={(selectedSchools.includes(s.id) ? '✓ ' : '') + s.name}
              onPress={() => toggle(s.id, selectedSchools, setSelectedSchools)}
            />
          ))}
        </>
      )}
    </Sheet>
  );
}
