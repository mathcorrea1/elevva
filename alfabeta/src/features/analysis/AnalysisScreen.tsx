import { Page, Card, Copy, Action, Stack, Notice } from '@/shared/ui';
import type { Analysis } from '@/shared/contracts';
import { useResource, useCommand } from '@/shared/data/hooks';
import type { ScreenProps as Props } from '@/app/routes';
import { LoadState, SaveState } from '@/shared/ui/ResourceState';
import { EditReview } from './EditReview';
import { levelLabel } from '@/features/assessments/levels';
import { Eyebrow, Badge, Disclosure } from '@/shared/ui/learning';
const statusLabels: Record<string, string> = {
  pending: 'Em análise',
  completed: 'Resultado disponível para revisão',
  interrupted: 'Interrompida pelo reinício',
  quota: 'Cota temporariamente indisponível',
  timeout: 'Tempo esgotado',
  invalid_response: 'Resposta inválida do serviço',
  unavailable: 'Serviço indisponível',
  provider_error: 'Falha do serviço',
  refused: 'Solicitação recusada',
  truncated: 'Resposta incompleta',
};
const reviewLabels: Record<string, string> = {
  accepted: 'Aceita',
  edited: 'Ajustada pelo adulto',
  rejected: 'Rejeitada',
};

export function AnalysisScreen({ route }: Props<'Analysis'>) {
  const { student } = route.params;
  const result = useResource<Analysis[]>('/students/' + student.id + '/analyses');
  const save = useCommand();
  return (
    <Page>
      <Eyebrow>MAIS CONTEXTO PARA O SEU OLHAR</Eyebrow>
      <Copy heading headingLevel={1} size="display">
        Apoio com IA
      </Copy>
      <Copy>{student.name}</Copy>
      <Badge text="REVISÃO HUMANA SEMPRE" />
      <Notice text="Sugestões precisam de revisão adulta. Esta versão utiliza somente perfis fictícios." />
      <Disclosure title="Como funciona a análise">
        <Copy>
          A análise usa os registros autorizados e pode errar. Não faz diagnóstico nem confirma
          nível. Sem critérios revisados ou evidências suficientes, informa seus limites.
        </Copy>
      </Disclosure>
      <Action
        title={save.busy ? 'Analisando evidências…' : 'Gerar análise das evidências'}
        disabled={save.busy}
        onPress={() =>
          void save.run('/students/' + student.id + '/analyses', {}, () => result.reload())
        }
      />
      <SaveState command={save} />
      <LoadState resource={result} />
      {result.data?.length === 0 && (
        <Copy>Ainda não há análises. Cadastro e atividades funcionam mesmo sem IA.</Copy>
      )}
      {result.data?.map((a) => (
        <Card key={a.id}>
          <Copy>
            {statusLabels[a.status] || a.status} ·{' '}
            {a.origin === 'pregenerated'
              ? 'Exemplo pré-gerado · sem chamada de IA'
              : a.origin === 'cached'
                ? 'Cache'
                : 'Chamada ao serviço'}{' '}
            · {a.model}
          </Copy>
          <Copy muted>{new Date(a.created_at).toLocaleString('pt-BR')}</Copy>
          {a.snapshot&&<><Copy heading>Fatos do recorte utilizado</Copy><Copy>{a.snapshot.evidence.filter(e=>e.type==='attempt').length} entregas de atividades e {a.snapshot.evidence.filter(e=>e.type==='assessment').length} registros de avaliação incluídos naquele recorte.</Copy><Copy muted>Contagens do servidor. Textos livres e informações restritas não entram na análise. São diferentes das interpretações do modelo.</Copy></>}
          {!!a.result && (
            <>
              <Copy heading>{a.result.state==='insufficient'?'Dados insuficientes para conclusão pedagógica':'Hipótese do modelo · revisar antes de usar'}</Copy>
              <Copy>{a.result.summary}</Copy>
              <Copy>
                Sugestão:{' '}
                {a.result.suggested_level
                  ? levelLabel(a.result.suggested_level)
                  : 'Dados insuficientes'}
              </Copy>
              {a.result.limitations.map((v) => (
                <Copy key={v}>{v}</Copy>
              ))}
              {a.result.recommendations.map((v) => (
                <Copy key={v.activity_id}>{v.reason}</Copy>
              ))}
            </>
          )}
          <Copy>Revisão humana: {a.review ? reviewLabels[a.review] || a.review : 'Pendente'}</Copy>
          {a.revised_result && <Copy>Resumo revisado: {a.revised_result.summary}</Copy>}
          {a.reviewed_at && (
            <Copy muted>Revisado em {new Date(a.reviewed_at).toLocaleString('pt-BR')}</Copy>
          )}
          {a.status === 'completed' && (
            <EditReview analysis={a} studentId={student.id} changed={result.reload} />
          )}
          {a.status === 'completed' && !a.review && (
            <Stack>
              {['accepted', 'rejected'].map((decision) => (
                <Action
                  key={decision}
                  secondary
                  title={
                    decision === 'accepted'
                      ? 'Registrar revisão: aceitar'
                      : 'Registrar revisão: rejeitar'
                  }
                  disabled={save.busy}
                  onPress={() =>
                    void save.run(
                      '/students/' + student.id + '/analyses/' + a.id + '/review',
                      { decision },
                      () => result.reload(),
                    )
                  }
                />
              ))}
            </Stack>
          )}
        </Card>
      ))}
    </Page>
  );
}
