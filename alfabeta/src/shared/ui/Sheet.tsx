import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Copy } from './index';

/** RN Modal isolates assistive focus; the web dialog also traps Tab and restores its opener. */
export function Sheet({
  visible,
  title,
  close,
  children,
  footer,
}: React.PropsWithChildren<{
  visible: boolean;
  title: string;
  close: () => void;
  footer?: React.ReactNode;
}>) {
  const { colors, reducedMotion, preferences } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const panel = useRef<View>(null);
  const [focused, setFocused] = useState(false);
  const closeRef = useRef(close);
  closeRef.current = close;
  const drag = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 12 && Math.abs(g.dx) < 25,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 65) closeRef.current();
      },
    }),
  ).current;
  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;
    const previous = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    const wasInert = root?.inert;
    const previousHidden = root?.getAttribute('aria-hidden');
    if (root) {
      root.inert = true;
      root.setAttribute('aria-hidden', 'true');
    }
    const timer = setTimeout(() => {
      const element = panel.current as unknown as HTMLElement;
      if (!element?.contains(document.activeElement))
        element?.querySelector<HTMLElement>('[role="button"]')?.focus();
    }, 50);
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const element = panel.current as unknown as HTMLElement;
      const nodes = Array.from(
        element?.querySelectorAll<HTMLElement>(
          'button, input, textarea, select, [tabindex="0"], [role="button"]',
        ) || [],
      ).filter(
        (n) =>
          n.getClientRects().length &&
          n.getAttribute('aria-disabled') !== 'true' &&
          !n.hasAttribute('disabled'),
      );
      if (!nodes.length) {
        event.preventDefault();
        return;
      }
      const current = nodes.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && current <= 0) {
        event.preventDefault();
        nodes[nodes.length - 1].focus();
      } else if (!event.shiftKey && (current === nodes.length - 1 || current < 0)) {
        event.preventDefault();
        nodes[0].focus();
      }
    }
    document.addEventListener('keydown', key, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', key, true);
      if (root) {
        root.inert = !!wasInert;
        if (previousHidden === null || previousHidden === undefined)
          root.removeAttribute('aria-hidden');
        else root.setAttribute('aria-hidden', previousHidden);
      }
      previous?.focus();
    };
  }, [visible]);
  const desktop = width >= 800;
  return (
    <Modal
      transparent
      accessibilityLabel={Platform.OS === 'web' ? title : undefined}
      visible={visible}
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={close}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          justifyContent: desktop ? 'center' : 'flex-end',
          alignItems: 'center',
          backgroundColor: 'rgba(8,22,44,0.48)',
          padding: desktop ? 28 : 0,
        }}
      >
        <View
          ref={panel}
          accessibilityViewIsModal
          accessibilityLabel={Platform.OS === 'web' ? undefined : title}
          style={{
            width: '100%',
            maxWidth: 620,
            maxHeight: height - insets.top - 24,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderBottomLeftRadius: desktop ? 28 : 0,
            borderBottomRightRadius: desktop ? 28 : 0,
            borderWidth: preferences.contrast ? 2 : 0,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <View
            {...drag.panHandlers}
            accessible={false}
            style={{ height: 22, alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              style={{ width: 40, height: 4, borderRadius: 4, backgroundColor: colors.border }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Copy heading>{title}</Copy>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar painel"
              onPress={close}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={({ pressed }) => ({
                minWidth: 48,
                minHeight: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.primarySoft : colors.mutedSurface,
                borderWidth: 2,
                borderColor: focused ? colors.focus : 'transparent',
              })}
            >
              <X color={colors.text} size={22} />
            </Pressable>
          </View>
          <ScrollView
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12, gap: 18 }}
          >
            {children}
          </ScrollView>
          {!!footer && (
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 12,
                borderTopWidth: 1,
                borderColor: colors.divider,
              }}
            >
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
