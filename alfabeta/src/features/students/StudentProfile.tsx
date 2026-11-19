import React, { useState } from 'react';
import type { Student } from '@/shared/contracts';
import { Card, Copy, Action, Field, Notice } from '@/shared/ui';
import { useCommand } from '@/shared/data/hooks';
export function StudentProfile({
  student,
  changed,
  startEditing = false,
}: {
  student: Student;
  changed: () => Promise<void>;
  startEditing?: boolean;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [name, setName] = useState(student.name);
  const [birth, setBirth] = useState(student.birth_date || '');
  const [supports, setSupports] = useState(student.supports.join('; '));
  const save = useCommand();
  return (
    <Card>
      {!startEditing && (
        <Action
          secondary
          title={editing ? 'Fechar edição do perfil' : 'Editar perfil do estudante'}
          onPress={() => setEditing((v) => !v)}
        />
      )}
      {editing && (
        <>
          <Field label="Nome do estudante" value={name} onChangeText={setName} maxLength={60} />
          <Field
            label="Nascimento (opcional, AAAA-MM-DD)"
            value={birth}
            onChangeText={setBirth}
            maxLength={10}
          />
          <Field
            label="Adaptações úteis (opcional)"
            value={supports}
            onChangeText={setSupports}
            maxLength={300}
          />
          <Copy muted>Sem diagnóstico obrigatório. A idade não determina o nível.</Copy>
          <Action
            title="Salvar perfil do estudante"
            disabled={save.busy || name.trim().length < 2}
            onPress={() =>
              void save.run(
                '/students/' + student.id + '/profile',
                {
                  name,
                  birth_date: birth || null,
                  supports: supports
                    .split(';')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  version: student.version,
                },
                async () => {
                  setEditing(false);
                  await changed();
                },
                'PATCH',
              )
            }
          />
          {save.error ? <Notice error text={save.error} /> : null}
          {save.message ? <Notice text={save.message} /> : null}
        </>
      )}
    </Card>
  );
}
