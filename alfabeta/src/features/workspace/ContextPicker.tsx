import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react-native';
import { Action, Copy, Field } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Pills, Badge } from '@/shared/ui/learning';
import { useWorkspace } from '@/app/Workspace';
import { useResource } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import { validOptionalDate } from '@/shared/dates';
export type School = {
  id: string;
  name: string;
  can_manage?: boolean;
  access_role?: 'owner' | 'manager' | 'teacher';
};
export type Room = { id: string; name: string; school_id: string };
export function ContextPicker() {
  const { value, update } = useWorkspace();
  const schools = useResource<School[]>('/schools');
  const rooms = useResource<Room[]>('/classrooms');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const validDates =
    validOptionalDate(draft.start) &&
    validOptionalDate(draft.end) &&
    (!draft.start || !draft.end || draft.start <= draft.end);
  return (
    <>
      <Action
        secondary
        icon={SlidersHorizontal}
        title={value.schoolId ? 'Trocar contexto e período' : 'Selecionar escola e turma'}
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      />
      {!!(value.schoolId || value.start || value.end) && (
        <Badge
          text={[
            schools.data?.find((s) => s.id === value.schoolId)?.name,
            rooms.data?.find((r) => r.id === value.classroomId)?.name,
            value.start || value.end ? 'Período filtrado' : 'Todo o histórico',
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      )}
      <Sheet visible={open} title="Contexto de acompanhamento" close={() => setOpen(false)}>
        <Copy>Escola</Copy>
        <LoadState resource={schools} />
        <Pills
          value={draft.schoolId}
          options={[
            { value: '', label: 'Escolha uma escola' },
            ...(schools.data || []).map((s) => ({ value: s.id, label: s.name })),
          ]}
          onChange={(schoolId) => setDraft({ ...draft, schoolId, classroomId: '', studentId: '' })}
        />
        <Copy>Turma</Copy>
        <LoadState resource={rooms} />
        <Pills
          value={draft.classroomId}
          options={[
            { value: '', label: 'Todas as turmas da escola' },
            ...(rooms.data || [])
              .filter((r) => r.school_id === draft.schoolId)
              .map((r) => ({ value: r.id, label: r.name })),
          ]}
          onChange={(classroomId) => setDraft({ ...draft, classroomId, studentId: '' })}
        />
        <Copy>Período opcional</Copy>
        <Field
          label="Início (AAAA-MM-DD)"
          value={draft.start}
          onChangeText={(start) => setDraft({ ...draft, start })}
        />
        <Field
          label="Fim (AAAA-MM-DD)"
          value={draft.end}
          onChangeText={(end) => setDraft({ ...draft, end })}
        />
        {!validDates && <Copy>Informe datas válidas, com o início antes do fim.</Copy>}
        <Action
          title="Aplicar filtros"
          disabled={!validDates}
          onPress={() => {
            update(draft);
            setOpen(false);
          }}
        />
        <Action
          secondary
          title="Limpar seleções"
          onPress={() =>
            setDraft({ schoolId: '', classroomId: '', studentId: '', start: '', end: '' })
          }
        />
        <Action quiet title="Cancelar alterações" onPress={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
export function contextQuery(
  value: { schoolId: string; classroomId: string; start: string; end: string },
  search = '',
) {
  const params = new URLSearchParams();
  if (value.schoolId) params.set('school_id', value.schoolId);
  if (value.classroomId) params.set('classroom_id', value.classroomId);
  if (value.start) params.set('start', value.start);
  if (value.end) params.set('end', value.end);
  if (search) params.set('search', search);
  return '?' + params.toString();
}
