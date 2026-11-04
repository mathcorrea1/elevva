import React, { useState } from 'react';
import { Card, Copy, Field, Action } from '@/shared/ui';
import { useCommand, useResource } from '@/shared/data/hooks';
import { SaveState, LoadState } from '@/shared/ui/ResourceState';
type Flag = { id: string; reason: string; resolved_at: string | null; created_at: string };
export function AttentionCard({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const save = useCommand();
  const resource = useResource<Flag[]>('/students/' + studentId + '/attention');
  return (
    <Card>
      <Action
        secondary
        title={open ? 'Fechar pontos de acompanhamento' : 'Pontos para acompanhar com atenção'}
        onPress={() => setOpen((v) => !v)}
      />
      {open && (
        <>
          <Copy>
            Registre um ponto observado e o motivo. Nenhum alerta é criado automaticamente por
            idade, pontuação ou comparação entre estudantes.
          </Copy>
          <LoadState resource={resource} />
          {resource.data?.map((f) => (
            <Card key={f.id}>
              <Copy>{f.reason}</Copy>
              <Copy muted>
                {f.resolved_at
                  ? 'Acompanhamento encerrado em ' +
                    new Date(f.resolved_at).toLocaleDateString('pt-BR')
                  : 'Em acompanhamento desde ' + new Date(f.created_at).toLocaleDateString('pt-BR')}
              </Copy>
              {!f.resolved_at && (
                <Action
                  secondary
                  title="Registrar encerramento deste acompanhamento"
                  disabled={save.busy}
                  onPress={() =>
                    void save.run(
                      '/students/' + studentId + '/attention/' + f.id + '/resolve',
                      {},
                      () => resource.reload(),
                    )
                  }
                />
              )}
            </Card>
          ))}
          <Field
            label="O que merece acompanhamento e por quê?"
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={1000}
          />
          <Action
            title="Salvar ponto de acompanhamento"
            disabled={save.busy || reason.trim().length < 10}
            onPress={() =>
              void save.run('/students/' + studentId + '/attention', { reason }, async () => {
                setReason('');
                await resource.reload();
              })
            }
          />
          <SaveState command={save} />
        </>
      )}
    </Card>
  );
}
