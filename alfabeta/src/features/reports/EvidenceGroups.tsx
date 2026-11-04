import { View } from 'react-native';
import { Card, Copy, Notice } from '@/shared/ui';
import { Badge, Disclosure } from '@/shared/ui/learning';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { ComparableGroup } from './overviewTypes';
import { supportLabel } from './overviewTypes';
export function EvidenceGroups({ groups }: { groups: ComparableGroup[] }) {
  const { colors } = useTheme();
  return (
    <>
      {!groups.length && (
        <Notice text="Ainda não há entregas objetivas comparáveis no período. Isso não representa desempenho zero." />
      )}
      {groups.map((g, i) => (
        <Card key={i}>
          <Badge text={g.skill} />
          <Copy heading>{g.prompt}</Copy>
          <Copy size="caption" muted>
            {g.title} · versão {g.content_version} · item {g.item_id}
          </Copy>
          <Copy>
            {g.correct} acertos em {g.responses} respostas comparáveis · {g.students} estudante(s).
          </Copy>
          {!!g.pending_review && (
            <Copy>
              {g.pending_review} resposta(s) aguardam revisão e não entram no denominador de
              correção.
            </Copy>
          )}
          {g.responses > 0 && (
            <>
              <View
                aria-hidden={true}
                accessible={false}
                style={{
                  height: 14,
                  borderRadius: 6,
                  overflow: 'hidden',
                  backgroundColor: colors.divider,
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    height: 14,
                    width: `${g.responses ? (g.correct / g.responses) * 100 : 0}%`,
                    backgroundColor: colors.primary,
                  }}
                />
                <View style={{ height: 14, flex: 1, backgroundColor: colors.accent }} />
              </View>
              <Copy size="caption">
                Azul: acertos · Amarelo: outras respostas. Unidade: respostas; não é percentual de
                alfabetização.
              </Copy>
            </>
          )}
          <Copy muted>
            Apoios informados:{' '}
            {g.supports_used.length
              ? g.supports_used.map(supportLabel).join(', ')
              : 'nenhum registrado nesta entrega'}
            . Ausência de registro não garante condições idênticas.
          </Copy>
          <Disclosure title="Respostas para investigar">
            {g.errors.length ? (
              g.errors.map((e) => (
                <Copy key={e.response}>
                  Resposta “{e.response}”: {e.count} ocorrência(s) sem acerto.
                </Copy>
              ))
            ) : (
              <Copy>
                Não há erro registrado neste grupo; isso não comprova domínio de toda a habilidade.
              </Copy>
            )}
            <Copy size="caption" muted>
              Evidências: {g.evidence_ids.join(', ')}
            </Copy>
          </Disclosure>
        </Card>
      ))}
    </>
  );
}
