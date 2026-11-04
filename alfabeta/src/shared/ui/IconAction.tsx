import { useState } from 'react';
import { Pressable, Platform } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeProvider';
export function IconAction({
  label,
  icon: Icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={({ pressed }) => ({
        minWidth: 48,
        minHeight: 48,
        borderWidth: 2,
        borderColor: focus ? colors.focus : colors.border,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.primarySoft : colors.surface,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Icon
        color={colors.primary}
        size={20}
        accessible={Platform.OS === 'web' ? undefined : false}
        aria-hidden
      />
    </Pressable>
  );
}
