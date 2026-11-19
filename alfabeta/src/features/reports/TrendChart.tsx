import { View } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { Copy, Card } from '@/shared/ui';
import { Disclosure } from '@/shared/ui/learning';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { Report } from '@/shared/contracts';
export function TrendChart({ series }: { series: Report['series'] }) {
  const { colors } = useTheme();
  const parts = [
    { key: 'activities' as const, label: 'Entregas', color: colors.primary, dash: '' },
    { key: 'assessments' as const, label: 'Avaliações', color: colors.success, dash: '6 4' },
    { key: 'observations' as const, label: 'Observações', color: colors.secondary, dash: '2 4' },
  ];
  const max = Math.max(1, ...series.flatMap((p) => parts.map((part) => p[part.key])));
  const left = 36,
    top = 12,
    width = 452,
    height = 132;
  const first = series.length ? Date.parse(series[0].day) : 0;
  const last = series.length ? Date.parse(series[series.length - 1].day) : 0;
  const x = (day: string) =>
    left + (last === first ? width / 2 : ((Date.parse(day) - first) / (last - first)) * width);
  const y = (n: number) => top + height - (n / max) * height;
  const labels = [...new Set([0, Math.floor((series.length - 1) / 2), series.length - 1])].filter(
    (i) => i >= 0,
  );
  return (
    <Card>
      <Copy heading>Aprendizagem em movimento</Copy>
      <Copy size="caption" muted>
        Registros por dia · horário de Brasília
      </Copy>
      {series.length ? (
        <>
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
          >
            <Svg width="100%" height={190} viewBox="0 0 520 190">
              {[0, max].map((n) => (
                <Line
                  key={n}
                  x1={left}
                  x2={left + width}
                  y1={y(n)}
                  y2={y(n)}
                  stroke={colors.divider}
                />
              ))}
              <SvgText x={28} y={y(0) + 4} textAnchor="end" fill={colors.secondary} fontSize={12}>
                0
              </SvgText>
              <SvgText x={28} y={y(max) + 4} textAnchor="end" fill={colors.secondary} fontSize={12}>
                {max}
              </SvgText>
              {parts.map((part) => (
                <Path
                  key={part.key}
                  d={
                    series.length === 1
                      ? `M${x(series[0].day) - 4} ${y(series[0][part.key])}h8`
                      : series
                          .map(
                            (point, i) => `${i ? 'L' : 'M'}${x(point.day)} ${y(point[part.key])}`,
                          )
                          .join(' ')
                  }
                  stroke={part.color}
                  strokeWidth={3}
                  strokeDasharray={part.dash || undefined}
                  fill="none"
                />
              ))}
              {labels.map((i) => (
                <SvgText
                  key={i}
                  x={x(series[i].day)}
                  y={174}
                  textAnchor="middle"
                  fill={colors.secondary}
                  fontSize={12}
                >
                  {series[i].day.slice(5).split('-').reverse().join('/')}
                </SvgText>
              ))}
            </Svg>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {parts.map((part) => (
              <View key={part.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: part.color }}
                />
                <Copy size="caption">{part.label}</Copy>
              </View>
            ))}
          </View>
          <Disclosure title="Consultar os números do gráfico">
            {series.map((point) => (
              <Copy key={point.day} size="caption">
                {point.day.split('-').reverse().join('/')}: {point.activities} entregas,{' '}
                {point.assessments} avaliações e {point.observations} observações.
              </Copy>
            ))}
          </Disclosure>
        </>
      ) : (
        <Copy muted>
          Os registros salvos aparecerão aqui. Sem dados não significa resultado zero.
        </Copy>
      )}
      <Copy size="caption" muted>
        Entregas contam tentativas finalizadas. Não é uma medida de alfabetização.
      </Copy>
    </Card>
  );
}
