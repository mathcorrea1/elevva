import { useState } from 'react';
import type { ReactNode } from 'react';
import { View, Text, Pressable, useWindowDimensions, Platform } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { Copy } from './index';

export function ScreenTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View style={{ flex: 1, minWidth: 160 }}>
          <Copy heading headingLevel={1} size="display">
            {title}
          </Copy>
        </View>
        {action}
      </View>
      {!!subtitle && <Copy muted>{subtitle}</Copy>}
    </View>
  );
}
export type Shortcut = { title: string; detail?: string; icon: LucideIcon; onPress: () => void };
function ShortcutCard({ title, detail, icon: Icon, onPress }: Shortcut) {
  const { colors, preferences } = useTheme();
  const [focused, focus] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={detail}
      onPress={onPress}
      onFocus={() => focus(true)}
      onBlur={() => focus(false)}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 112,
        padding: 16,
        borderRadius: 20,
        gap: 10,
        backgroundColor: pressed ? colors.primarySoft : colors.surface,
        borderWidth: 2,
        borderColor: focused ? colors.focus : colors.divider,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icon
          size={23}
          color={colors.primary}
          aria-hidden
          accessible={Platform.OS === 'web' ? undefined : false}
        />
        <ChevronRight
          size={16}
          color={colors.secondary}
          aria-hidden
          accessible={Platform.OS === 'web' ? undefined : false}
        />
      </View>
      <View style={{ gap: 3 }}>
        <Text
          style={{
            color: colors.text,
            fontFamily: tokens.fontSemibold,
            fontSize: 14 * preferences.font_scale,
            lineHeight: 21 * preferences.font_scale,
          }}
        >
          {title}
        </Text>
        {!!detail && (
          <Copy muted size="caption">
            {detail}
          </Copy>
        )}
      </View>
    </Pressable>
  );
}
export function ShortcutGrid({ items, columns = 2 }: { items: Shortcut[]; columns?: 2 | 3 | 4 }) {
  const { width, fontScale } = useWindowDimensions();
  const { preferences } = useTheme();
  const count =
    width < 350 || fontScale * preferences.font_scale > 1.3 ? 1 : width >= 1000 ? columns : 2;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {items.map((item) => (
        <View
          key={item.title}
          style={{
            flexBasis: count === 1 ? '100%' : `${100 / count - 3}%`,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <ShortcutCard {...item} />
        </View>
      ))}
    </View>
  );
}
export function Metrics({ items }: { items: { label: string; value: number | string }[] }) {
  const { colors, preferences } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.surface,
      }}
    >
      {items.map((item) => (
        <View key={item.label} style={{ flex: 1, minWidth: 90, padding: 14, gap: 3 }}>
          <Text
            style={{
              color: colors.primary,
              fontFamily: tokens.fontHeading,
              fontSize: 25 * preferences.font_scale,
            }}
          >
            {item.value}
          </Text>
          <Copy size="caption" muted>
            {item.label}
          </Copy>
        </View>
      ))}
    </View>
  );
}
