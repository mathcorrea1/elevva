import { Card, Copy, Loading, Notice } from '@/shared/ui';
import type { Content } from '@/shared/contracts';
import { useResource } from '@/shared/data/hooks';
import { ContentDetails } from './ContentDetails';
type Revision = {
  id: string;
  version: number;
  captured_at: string;
  snapshot: Pick<Content, 'kind' | 'title' | 'body'>;
  review: { approved: boolean; note: string; reviewed_at: string } | null;
};
export function ContentRevisionHistory({ content }: { content: Content }) {
  const result = useResource<Revision[]>('/content/' + content.id + '/revisions');
  return (
    <Card>
      <Copy heading>Histórico de autoria</Copy>
      {result.loading && <Loading />}
      {!!result.error && <Notice error text={result.error} />}
      {result.data?.length === 0 && (
        <Copy>
          Conteúdo anterior ao registro de versões. A próxima edição de rascunho preservará seu
          estado atual.
        </Copy>
      )}
      {result.data?.map((revision) => (
        <Card key={revision.id}>
          <Copy heading headingLevel={3}>
            Versão {revision.version} · {revision.snapshot.title}
          </Copy>
          <Copy muted>
            Snapshot preservado em {new Date(revision.captured_at).toLocaleString('pt-BR')}.
          </Copy>
          <Copy>
            {revision.review
              ? revision.review.approved
                ? 'Parecer favorável desta versão'
                : 'Parecer não favorável desta versão'
              : 'Sem parecer desta versão'}
          </Copy>
          {!!revision.review && <Copy>{revision.review.note}</Copy>}
          <ContentDetails
            content={{ ...content, ...revision.snapshot, version: revision.version }}
          />
        </Card>
      ))}
    </Card>
  );
}
