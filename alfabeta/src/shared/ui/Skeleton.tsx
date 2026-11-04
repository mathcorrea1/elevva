import { View } from 'react-native';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Copy } from './index';
/** Static placeholders avoid flashing/motion and keep a meaningful loading announcement. */
export function Skeleton() {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel="Carregando registros"
      style={{ gap: 12, paddingVertical: 12 }}
    >
      <Copy muted>Carregando registros…</Copy>
      <View
        accessible={false}
        aria-hidden={true}
        style={{
          gap: 10,
          borderRadius: 20,
          padding: 20,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
        }}
      >
        {[75, 100, 50].map((width, i) => (
          <View
            key={i}
            style={{
              height: i === 0 ? 24 : 14,
              width: `${width}%`,
              borderRadius: 7,
              backgroundColor: colors.divider,
            }}
          />
        ))}
      </View>
    </View>
  );
}
