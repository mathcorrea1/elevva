import React from 'react';
import { Card, Copy, Action } from '@/shared/ui';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { useResource, useCommand } from '@/shared/data/hooks';
export function FollowupCard() {
  const resource = useResource<{ enabled: boolean; created_at: string | null }>('/me/follow-up');
  const save = useCommand();
  return (
    <Card>
      <Copy heading>Participação futura — opcional</Copy>
      <Copy>
        Você pode registrar interesse em receber um convite para avaliar versões futuras do Eleva. A
        participação é voluntária e pode ser revogada sem afetar o uso do aplicativo. Esta etapa
        apenas registra sua escolha; não envia mensagens nem inscreve estudantes em pesquisas.
      </Copy>
      <LoadState resource={resource} />
      {resource.data && (
        <>
          <Copy>Interesse registrado: {resource.data.enabled ? 'Sim' : 'Não'}</Copy>
          <Action
            secondary
            title={
              resource.data.enabled
                ? 'Revogar meu interesse'
                : 'Quero participar de avaliações futuras'
            }
            disabled={save.busy}
            onPress={() =>
              void save.run(
                '/me/follow-up',
                { enabled: !resource.data?.enabled, notice_version: '2026-10-22-v1' },
                () => resource.reload(),
              )
            }
          />
        </>
      )}
      <Copy muted>
        Texto de finalidade v2026-10-22-v1. Uso futuro do contato e retenção dos registros dependem
        de política e autorização próprias.
      </Copy>
      <SaveState command={save} />
    </Card>
  );
}
