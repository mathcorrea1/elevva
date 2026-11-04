import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { FileText, Image as ImageIcon, Play, Puzzle, Flag } from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import type { LessonScreenData } from './types';
export function ScreenThumbnail({
  screen,
  index,
  selected,
  onPress,
}: {
  screen: LessonScreenData;
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, preferences } = useTheme();
  const [focus, setFocus] = useState(false);
  const Icon =
    screen.type === 'activity'
      ? Puzzle
      : screen.type.includes('video')
        ? Play
        : screen.type.includes('image')
          ? ImageIcon
          : screen.type === 'completion'
            ? Flag
            : FileText;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      accessibilityLabel={index + 1 + '. ' + (screen.title || 'Tela sem título')}
      onPress={onPress}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        minHeight: 112,
        padding: 12,
        gap: 9,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: focus ? colors.focus : selected ? colors.primary : colors.divider,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
      }}
    >
      <View
        aria-hidden
        accessible={false}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Icon color={colors.primary} size={24} />
        <Text
          style={{
            color: colors.secondary,
            fontFamily: tokens.fontSemibold,
            fontSize: 12 * preferences.font_scale,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        style={{
          color: colors.text,
          fontFamily: tokens.fontSemibold,
          fontSize: 12 * preferences.font_scale,
          lineHeight: 19 * preferences.font_scale,
        }}
      >
        {screen.title || (screen.type === 'activity' ? 'Nova atividade' : 'Nova descoberta')}
      </Text>
    </Pressable>
  );
}
