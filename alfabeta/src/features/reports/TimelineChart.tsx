import { View } from 'react-native';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Card, Copy, Notice } from '@/shared/ui';
import { Disclosure } from '@/shared/ui/learning';
import type { Report } from '@/shared/contracts';
export function TimelineChart({ series }: { series: Report['series'] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...series.map((p) => p.activities + p.assessments + p.observations));
  return (
    <Card>
      <Copy heading>Descobertas ao longo do tempo</Copy>
      <Copy muted>Contagem de registros por dia · horário de Brasília</Copy>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[
          { label: 'Entregas', color: colors.primary },
          { label: 'Avaliações', color: colors.secondary },
          { label: 'Observações', color: colors.success },
        ].map((l) => (
          <View key={l.label} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: l.color }} />
            <Copy size="caption">{l.label}</Copy>
          </View>
        ))}
      </View>
      {series.length === 0 ? (
        <Notice text="Ainda não há registros neste período. Uma atividade salva ou uma observação aparecerá aqui." />
      ) : (
        <>
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden={true}
            style={{ gap: 14 }}
          >
            {series.map((point) => (
              <View key={point.day} style={{ gap: 5 }}>
                <Copy size="caption">{point.day.split('-').reverse().join('/')}</Copy>
                <View
                  style={{
                    flexDirection: 'row',
                    height: 16,
                    backgroundColor: colors.mutedSurface,
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  {[
                    { key: 'activities', color: colors.primary },
                    { key: 'assessments', color: colors.secondary },
                    { key: 'observations', color: colors.success },
                  ].map((part) => (
                    <View
                      key={part.key}
                      style={{
                        width: `${((point[part.key as keyof typeof point] as number) / max) * 100}%`,
                        backgroundColor: part.color,
                      }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
          <Disclosure title="Ver números do gráfico" initiallyOpen={false}>
            {series.map((point) => (
              <Copy key={point.day}>
                {point.day.split('-').reverse().join('/')}: {point.activities} entregas de atividade,
                {point.assessments} avaliações e {point.observations} observações.
              </Copy>
            ))}
          </Disclosure>
        </>
      )}
      <Copy size="caption" muted>
        Unidade: registros. Entregas contam tentativas finalizadas; conclusão e avanço são apresentados separadamente. Observações são registros independentes. Não representa percentual de alfabetização.
      </Copy>
    </Card>
  );
}
