import React, { useState } from 'react';
import type { ScreenProps } from '@/app/routes';
import { Page, Copy, Card, Action, Field, Notice } from '@/shared/ui';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { useResource, useCommand } from '@/shared/data/hooks';
type Guidance = { id: string; title: string; text: string; status: string; created_at: string };
export function GuidanceScreen({ route }: ScreenProps<'Guidance'>) {
  const { student } = route.params;
  const resource = useResource<Guidance[]>('/students/' + student.id + '/guidance');
  const save = useCommand();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <Page title="Orientações individuais">
      <Copy>{student.name}</Copy>
      <Copy muted>
        Registros docentes para os adultos autorizados. Orientação pedagógica ainda precisa de
        revisão antes do uso com estudantes reais.
      </Copy>
      <LoadState resource={resource} />
      {resource.data?.length === 0 && (
        <Notice text="Ainda não há orientações individuais. A biblioteca reúne o conteúdo geral disponível." />
      )}
      {resource.data?.map((g) => (
        <Card key={g.id}>
          <Copy heading>{g.title}</Copy>
          <Copy muted>
            {new Date(g.created_at).toLocaleString('pt-BR')} ·{' '}
            {g.status === 'pending_review' ? 'Pendente de revisão pedagógica' : g.status}
          </Copy>
          <Copy>{g.text}</Copy>
        </Card>
      ))}
      {student.role === 'teacher' && (
        <Card>
          <Action
            secondary
            title={open ? 'Fechar autoria' : 'Escrever orientação docente'}
            onPress={() => setOpen((v) => !v)}
          />
          {open && (
            <>
              <Field
                label="Título da orientação"
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />
              <Field
                label="Orientação para os adultos que acompanham"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={1500}
              />
              <Action
                title="Salvar orientação para revisão"
                disabled={save.busy || title.trim().length < 2 || text.trim().length < 5}
                onPress={() =>
                  void save.run(
                    '/students/' + student.id + '/guidance',
                    { title, text },
                    async () => {
                      setTitle('');
                      setText('');
                      setOpen(false);
                      await resource.reload();
                    },
                  )
                }
              />
            </>
          )}
        </Card>
      )}
      <SaveState command={save} />
    </Page>
  );
}
