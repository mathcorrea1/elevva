import { useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, View } from 'react-native';
import { Hand, Sparkles, type LucideIcon } from 'lucide-react-native';
import { LibrasContext } from '@/features/accessibility/libras-context';
import { useTheme } from '@/shared/theme/ThemeProvider';

// The scene reserves this space. Neither shortcut covers a form, list row or lesson footer.
export const ASSISTANT_DOCK_INSET = 76;

export function useSoftwareKeyboard() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const viewport = window.visualViewport;
      const resize = () => setOpen(!!viewport && window.innerHeight - viewport.height > 150);
      viewport?.addEventListener('resize', resize);
      return () => viewport?.removeEventListener('resize', resize);
    }
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

function Shortcut({
  label,
  icon: Icon,
  onPress,
  primary = false,
  selected = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  primary?: boolean;
  selected?: boolean;
}) {
  const { colors, preferences } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={Platform.OS !== 'web' && selected ? { selected: true } : undefined}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...(Platform.OS === 'web'
        ? { title: label, 'aria-current': selected ? 'page' : undefined }
        : {})}
      style={({ pressed }) => ({
        width: 52,
        height: 52,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: focused ? colors.focus : primary ? colors.primary : colors.border,
        backgroundColor: primary ? colors.primary : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: preferences.contrast ? 0 : 0.12,
        shadowRadius: 8,
        elevation: preferences.contrast ? 0 : 3,
      })}
    >
      <Icon
        size={24}
        color={primary ? colors.onPrimary : colors.primary}
        aria-hidden
        accessible={Platform.OS === 'web' ? undefined : false}
      />
    </Pressable>
  );
}

export function AssistantDock({
  bottomInset,
  rightInset = 0,
  showAI,
  aiSelected = false,
  openAI,
}: {
  bottomInset: number;
  rightInset?: number;
  showAI: boolean;
  aiSelected?: boolean;
  openAI: () => void;
}) {
  const { open } = useContext(LibrasContext);
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: bottomInset + 12,
        right: rightInset + 16,
        flexDirection: 'row',
        gap: 10,
      }}
    >
      <Shortcut icon={Hand} label="Abrir apoio em Libras" onPress={open} />
      {showAI && (
        <Shortcut
          icon={Sparkles}
          label="Abrir recursos de inteligência artificial"
          primary
          selected={aiSelected}
          onPress={openAI}
        />
      )}
    </View>
  );
}
