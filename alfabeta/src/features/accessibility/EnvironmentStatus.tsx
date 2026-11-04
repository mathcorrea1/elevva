import React from 'react';
import { Card, Copy, Notice } from '@/shared/ui';
import { useResource } from '@/shared/data/hooks';
export function EnvironmentStatus() {
  const health = useResource<{
    core: string;
    environment: string;
    database: string;
    identity: string;
    ai: string;
  }>('/health/ready');
  return (
    <Card>
      <Copy heading>Sobre esta execução</Copy>
      {health.data ? (
        <>
          <Copy>
            Ambiente: {health.data.environment}. Banco: {health.data.database}. Núcleo:{' '}
            {health.data.core}.
          </Copy>
          <Copy>
            Identidade: {health.data.identity}. IA: {health.data.ai}.
          </Copy>
          <Copy muted>
            Configuração não comprova integração testada. O registro de implementação distingue
            provas locais, serviços remotos e validação pedagógica.
          </Copy>
        </>
      ) : (
        <Notice text={health.error || 'Consultando o ambiente…'} />
      )}
    </Card>
  );
}
