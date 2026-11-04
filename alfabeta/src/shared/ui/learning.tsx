import { useState, type PropsWithChildren } from 'react';
import { Image, View, Text, Pressable, Platform } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { Copy } from './index';

export function Mascot({ size = 150, label }: { size?: number; label?: string }) {
  return (
    <Image
      // Metro requires a literal asset reference to bundle it for offline Android/web.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require('../../assets/mascot/lumi-welcome-v1.png')}
      resizeMode="contain"
      accessible={!!label}
      accessibilityLabel={label}
      style={{ width: size, height: size * 1.1, maxWidth: '100%' }}
    />
  );
}
export function Eyebrow({ children }: PropsWithChildren) {
  const { colors, preferences } = useTheme();
  return (
    <Text
      style={{
        fontFamily: tokens.fontSemibold,
        fontSize: 12 * preferences.font_scale,
        lineHeight: 18 * preferences.font_scale,
        letterSpacing: 1.8,
        color: colors.primary,
      }}
    >
      {children}
    </Text>
  );
}
export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Copy heading>{title}</Copy>
      {!!detail && (
        <Copy muted size="caption">
          {detail}
        </Copy>
      )}
    </View>
  );
}
export function Badge({ text, warm = false }: { text: string; warm?: boolean }) {
  const { colors, preferences } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: warm ? colors.accent : colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: preferences.contrast ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: tokens.fontSemibold,
          fontSize: 12 * preferences.font_scale,
          color: warm ? colors.onAccent : colors.primary,
          lineHeight: 18 * preferences.font_scale,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
export function MenuRow({
  title,
  detail,
  icon: Icon,
  onPress,
}: {
  title: string;
  detail?: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  const { colors, preferences } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={detail}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderWidth: focus ? 2 : 1,
        borderColor: focus ? colors.focus : colors.divider,
        backgroundColor: pressed ? colors.primarySoft : colors.surface,
        borderRadius: 18,
      })}
    >
      <View
        style={{
          backgroundColor: colors.primarySoft,
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          size={21}
          color={colors.primary}
          aria-hidden={true}
          accessible={Platform.OS === 'web' ? undefined : false}
        />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{
            fontFamily: tokens.fontSemibold,
            color: colors.text,
            fontSize: 14 * preferences.font_scale,
            lineHeight: 22 * preferences.font_scale,
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
      <ChevronRight
        size={18}
        color={colors.secondary}
        aria-hidden={true}
        accessible={Platform.OS === 'web' ? undefined : false}
      />
    </Pressable>
  );
}
export function Stat({ value, label }: { value: number; label: string }) {
  const { colors, preferences } = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: 120,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 18,
        padding: 18,
        gap: 3,
      }}
    >
      <Text
        style={{
          fontFamily: tokens.fontHeading,
          color: colors.text,
          fontSize: 28 * preferences.font_scale,
        }}
      >
        {value}
      </Text>
      <Copy muted size="caption">
        {label}
      </Copy>
    </View>
  );
}
export function Pills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors, preferences } = useTheme();
  const [focused, setFocused] = useState<string | null>(null);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityLabel={option.label}
          accessibilityState={{ selected: option.value === value }}
          aria-pressed={option.value === value}
          onPress={() => onChange(option.value)}
          onFocus={() => setFocused(option.value)}
          onBlur={() => setFocused(null)}
          style={{
            minHeight: 48,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: value === option.value ? colors.primary : colors.surface,
            borderWidth: 2,
            borderColor:
              focused === option.value
                ? colors.focus
                : value === option.value
                  ? colors.primary
                  : colors.divider,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: tokens.fontSemibold,
              color: option.value === value ? colors.onPrimary : colors.secondary,
              fontSize: 12 * preferences.font_scale,
              lineHeight: 20 * preferences.font_scale,
            }}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Disclosure({
  title,
  children,
  initiallyOpen = false,
}: PropsWithChildren<{ title: string; initiallyOpen?: boolean }>) {
  const [open, setOpen] = useState(initiallyOpen);
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        aria-expanded={open}
        onPress={() => setOpen(!open)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: focused ? colors.focus : colors.divider,
          borderWidth: focused ? 2 : 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Copy heading>{title}</Copy>
        <ChevronRight
          color={colors.primary}
          size={20}
          style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}
          aria-hidden={true}
          accessible={Platform.OS === 'web' ? undefined : false}
        />
      </Pressable>
      <View
        style={{ display: open ? 'flex' : 'none', gap: 16 }}
        accessibilityElementsHidden={!open}
      >
        {children}
      </View>
    </View>
  );
}
