import React, { useState } from 'react';
import type { Student, LearningEvent } from '@/shared/contracts';
import { Card, Copy, Field, Action, Notice } from '@/shared/ui';
import { useCommand, useResource } from '@/shared/data/hooks';
import { literacyOptions } from './levels';
import { useWorkspace } from '@/app/Workspace';
export function LevelConfirmation({
  student,
  events,
  changed,
}: {
  student: Student;
  events: LearningEvent[];
  changed: () => Promise<void>;
}) {
  const profile = useResource<Student>('/students/' + student.id);
  const { profession } = useWorkspace();
  const save = useCommand();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [justification, setJustification] = useState('');
  if (student.role !== 'teacher' && !(student.role === 'owner' && profession === 'teacher'))
    return null;
  return (
    <Card>
      <Action
        secondary
        title={open ? 'Fechar confirmação de nível' : 'Registrar confirmação humana de nível'}
        onPress={() => setOpen((v) => !v)}
      />
      {open && (
        <>
          <Notice text="Este registro é responsabilidade do docente autorizado. Não é uma conclusão da IA nem validação de uma rubrica. Use apenas demonstrações fictícias até revisão pedagógica e liberação de dados reais." />
          {literacyOptions.map(({ value: id, label }) => (
            <Action
              key={id}
              secondary={level !== id}
              title={(level === id ? 'Selecionado: ' : '') + label}
              onPress={() => setLevel(id)}
            />
          ))}
          <Copy>Selecione as evidências que justificam seu registro:</Copy>
          {events.map((e) => (
            <Action
              key={e.id}
              secondary={!evidence.includes(e.id)}
              title={
                (evidence.includes(e.id) ? 'Selecionada: ' : '') +
                (e.context || e.instrument || 'Execução') +
                ' — ' +
                new Date(e.created_at).toLocaleDateString('pt-BR')
              }
              onPress={() =>
                setEvidence((old) =>
                  old.includes(e.id) ? old.filter((v) => v !== e.id) : [...old, e.id],
                )
              }
            />
          ))}
          <Field
            label="Justificativa pedagógica do docente"
            value={justification}
            onChangeText={setJustification}
            multiline
            maxLength={1500}
          />
          <Action
            title="Confirmar registro de nível"
            disabled={
              save.busy ||
              !level ||
              !evidence.length ||
              justification.trim().length < 10 ||
              !profile.data
            }
            onPress={() =>
              void save.run(
                '/students/' + student.id + '/level-confirmations',
                { level, evidence_ids: evidence, justification, version: profile.data?.version },
                async () => {
                  setOpen(false);
                  await profile.reload();
                  await changed();
                },
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
