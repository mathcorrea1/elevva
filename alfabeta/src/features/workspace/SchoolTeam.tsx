import { useState } from 'react';
import { View } from 'react-native';
import { Users, UserPlus, ShieldCheck } from 'lucide-react-native';
import { Action, Copy, Field, Notice, Card } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Badge, Pills } from '@/shared/ui/learning';
import { useResource, useCommand } from '@/shared/data/hooks';
import { LoadState } from '@/shared/ui/ResourceState';
import type { Room } from './ContextPicker';
type Member = {
  adult_id: string;
  display_name: string;
  role: 'teacher' | 'manager';
  active: boolean;
  classroom_ids: string[];
};
export function SchoolTeam({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [target, setTarget] = useState('');
  const [role, setRole] = useState('teacher');
  const [selected, setSelected] = useState<Member | null>(null);
  const [revoke, setRevoke] = useState<Member | null>(null);
  const data = useResource<{
    owner: { display_name: string };
    items: Member[];
    can_promote_manager: boolean;
    next_offset: number | null;
  }>(open ? '/schools/' + schoolId + '/staff?offset=' + offset : null);
  const rooms = useResource<Room[]>(open ? '/classrooms' : null);
  const save = useCommand();
  async function changed() {
    setSelected(null);
    setRevoke(null);
    await data.reload();
    await rooms.reload();
  }
  return (
    <>
      <Action
        secondary
        icon={Users}
        title="Equipe e permissões da escola"
        onPress={() => setOpen(true)}
      />
      <Sheet
        visible={open}
        title="Equipe da escola"
        close={() => {
          if (!save.busy) setOpen(false);
        }}
      >
        <LoadState resource={data} />
        <Copy muted size="caption">
          Equipe dá acesso à organização escolar. Cada estudante exige um vínculo próprio,
          autorizado pelo gestor do cadastro.
        </Copy>
        {!!data.data && <Badge text={'Gestão principal: ' + data.data.owner.display_name} />}
        {selected ? (
          <>
            <Copy heading>Turmas de {selected.display_name}</Copy>
            {selected.role === 'manager' && (
              <Notice text="Gestores acessam a organização de todas as turmas desta escola. Os dados de estudantes continuam exigindo vínculos individuais." />
            )}
            {rooms.data
              ?.filter((r) => r.school_id === schoolId)
              .map((room) => (
                <Action
                  key={room.id}
                  secondary
                  title={room.name}
                  selected={selected.classroom_ids.includes(room.id)}
                  disabled={save.busy || selected.role === 'manager'}
                  onPress={() =>
                    void save.run(
                      '/classrooms/' + room.id + '/staff',
                      {
                        adult_id: selected.adult_id,
                        active: !selected.classroom_ids.includes(room.id),
                      },
                      changed,
                    )
                  }
                />
              ))}
            <Action quiet title="Voltar à equipe" onPress={() => setSelected(null)} />
          </>
        ) : (
          <>
            {data.data?.items.map((member) => (
              <Card key={member.adult_id}>
                <Copy heading>{member.display_name}</Copy>
                <Copy size="caption" muted>
                  {member.role === 'manager' ? 'Gestor' : 'Professor'} ·{' '}
                  {member.active ? 'Ativo' : 'Sem acesso institucional'}
                </Copy>
                {member.active && (
                  <Action
                    secondary
                    title={member.role === 'manager' ? 'Consultar turmas' : 'Definir turmas'}
                    disabled={save.busy}
                    onPress={() => setSelected(member)}
                  />
                )}
                <Action
                  quiet
                  destructive={member.active}
                  title={member.active ? 'Revogar acesso à escola' : 'Reativar na escola'}
                  disabled={save.busy}
                  onPress={() =>
                    member.active
                      ? setRevoke(member)
                      : void save.run(
                          '/schools/' + schoolId + '/staff',
                          { adult_id: member.adult_id, role: member.role, active: true },
                          changed,
                        )
                  }
                />
              </Card>
            ))}
            {data.data?.items.length === 0 && (
              <Copy muted>Convide outra conta docente para colaborar.</Copy>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {!!offset && (
                <Action
                  secondary
                  title="Página anterior da equipe"
                  onPress={() => setOffset(Math.max(0, offset - 20))}
                />
              )}
              {data.data?.next_offset != null && (
                <Action
                  secondary
                  title="Próxima página da equipe"
                  onPress={() => setOffset(data.data!.next_offset!)}
                />
              )}
            </View>
            <Copy heading>Adicionar à equipe</Copy>
            <Field
              label="Identificador da conta docente"
              value={target}
              onChangeText={setTarget}
              maxLength={128}
            />
            <Copy size="caption" muted>
              A outra pessoa encontra o identificador no próprio perfil. Não é necessário informar
              e-mail ou senha.
            </Copy>
            {data.data?.can_promote_manager && (
              <Pills
                value={role}
                onChange={setRole}
                options={[
                  { value: 'teacher', label: 'Professor' },
                  { value: 'manager', label: 'Gestor da escola' },
                ]}
              />
            )}
            <Action
              icon={UserPlus}
              title="Adicionar à equipe"
              disabled={!target.trim() || save.busy}
              onPress={() =>
                void save.run(
                  '/schools/' + schoolId + '/staff',
                  { adult_id: target.trim(), role, active: true },
                  async () => {
                    setTarget('');
                    await changed();
                  },
                )
              }
            />
          </>
        )}
        {!!save.error && <Notice error text={save.error} />}
        {revoke && (
          <Card>
            <ShieldCheck size={24} />
            <Copy>Revogar o acesso institucional de {revoke.display_name}?</Copy>
            <Copy size="caption" muted>
              As turmas desta escola deixam de aparecer para esta conta. Vínculos individuais
              concedidos separadamente permanecem até revogação própria.
            </Copy>
            <Action
              destructive
              title="Revogar acesso institucional"
              disabled={save.busy}
              onPress={() =>
                void save.run(
                  '/schools/' + schoolId + '/staff',
                  { adult_id: revoke.adult_id, role: revoke.role, active: false },
                  changed,
                )
              }
            />
            <Action quiet title="Cancelar revogação" onPress={() => setRevoke(null)} />
          </Card>
        )}
      </Sheet>
    </>
  );
}
