import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  View,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { Copy } from '@/shared/ui';
import { Mascot } from '@/shared/ui/learning';

export function PublicEntry({ children }: PropsWithChildren) {
  const { colors, preferences } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 900 && fontScale * preferences.font_scale <= 1.3;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, padding: wide ? 40 : 24, justifyContent: 'center' }}
        >
          <View style={{ width: '100%', maxWidth: 1040, alignSelf: 'center', gap: wide ? 32 : 20 }}>
            <Text
              accessibilityRole="header"
              aria-level={1}
              style={{
                fontFamily: tokens.fontDisplay,
                color: colors.primary,
                fontSize: 32 * preferences.font_scale,
                letterSpacing: -1.4,
              }}
            >
              eleva.
            </Text>
            <View
              style={{
                flexDirection: wide ? 'row' : 'column',
                gap: wide ? 56 : 20,
                alignItems: 'stretch',
              }}
            >
              {wide ? (
                <View
                  style={{
                    flex: 1,
                    borderRadius: 32,
                    backgroundColor: colors.hero,
                    padding: 36,
                    justifyContent: 'center',
                    gap: 24,
                  }}
                >
                  <Mascot size={200} />
                  <Text
                    style={{
                      fontFamily: tokens.fontHeading,
                      color: colors.onHero,
                      fontSize: 38 * preferences.font_scale,
                      lineHeight: 47 * preferences.font_scale,
                    }}
                  >
                    Pequenos passos.{'\n'}Grandes descobertas.
                  </Text>
                  <Text
                    style={{
                      fontFamily: tokens.fontFamily,
                      color: colors.heroMuted,
                      fontSize: 16 * preferences.font_scale,
                      lineHeight: 25 * preferences.font_scale,
                    }}
                  >
                    Aulas, trilhas e acompanhamento para aprender juntos.
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Mascot size={62} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Copy heading>Cada descoberta conta.</Copy>
                    <Copy muted size="caption">
                      Aprender juntos, no seu ritmo.
                    </Copy>
                  </View>
                </View>
              )}
              <View
                style={{
                  flex: wide ? 1 : undefined,
                  minWidth: 0,
                  gap: 14,
                  justifyContent: 'center',
                }}
              >
                {children}
                <View style={{ alignItems: 'center' }}>
                  <Copy muted size="caption">
                    Demonstração · dados fictícios
                  </Copy>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
