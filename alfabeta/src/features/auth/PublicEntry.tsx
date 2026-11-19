import { useState, useRef, type PropsWithChildren } from 'react';
import { ScrollView, View, Text, Pressable, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, LogIn } from 'lucide-react-native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { Copy } from '@/shared/ui';
import { Mascot } from '@/shared/ui/learning';
import { QuickAccessibility } from '@/features/accessibility/QuickAccessibility';
import { LibrasAction } from '@/features/accessibility/libras-context';

export function PublicEntry({ children }: PropsWithChildren) {
  const { colors, preferences } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 900 && fontScale * preferences.font_scale <= 1.5;
  const [tab, setTab] = useState<'login' | 'settings'>('login');
  const [focused, setFocused] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, View | null>>({});
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, padding: wide ? 40 : 24, justifyContent: 'center' }}
      >
        <View style={{ width: '100%', maxWidth: 1080, alignSelf: 'center', gap: 26 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <Text
              accessibilityRole="header"
              aria-level={1}
              style={{
                fontFamily: tokens.fontDisplay,
                color: colors.primary,
                fontSize: 32 * preferences.font_scale,
                letterSpacing: -1.5,
              }}
            >
              eleva
            </Text>
            <Text
              style={{
                fontFamily: tokens.fontMedium,
                color: colors.secondary,
                fontSize: 12 * preferences.font_scale,
              }}
            >
              APRENDER TRANSFORMA
            </Text>
            <LibrasAction />
          </View>
          <View
            style={{
              flexDirection: wide ? 'row' : 'column',
              gap: wide ? 44 : 22,
              alignItems: 'stretch',
            }}
          >
            {tab === 'login' && (
              <View
                style={{
                  flex: wide ? 1 : undefined,
                  borderRadius: 28,
                  backgroundColor: colors.hero,
                  padding: wide ? 32 : 22,
                  gap: 20,
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{ flexDirection: wide ? 'column' : 'row', alignItems: 'center', gap: 10 }}
                >
                  <View style={{ flex: 1, gap: 10 }}>
                    <Text
                      style={{
                        fontFamily: tokens.fontSemibold,
                        color: colors.heroMuted,
                        letterSpacing: 1.6,
                        fontSize: 12 * preferences.font_scale,
                      }}
                    >
                      CADA DESCOBERTA CONTA
                    </Text>
                    <Text
                      accessibilityRole="header"
                      aria-level={2}
                      style={{
                        fontFamily: tokens.fontDisplay,
                        color: colors.onHero,
                        fontSize: (wide ? 37 : 23) * preferences.font_scale,
                        lineHeight: (wide ? 47 : 31) * preferences.font_scale,
                        letterSpacing: -0.9,
                      }}
                    >
                      Um mundo de{wide ? '\n' : ' '}novos caminhos.
                    </Text>
                    {wide && (
                      <Text
                        style={{
                          fontFamily: tokens.fontFamily,
                          color: colors.heroMuted,
                          fontSize: 15 * preferences.font_scale,
                          lineHeight: 25 * preferences.font_scale,
                        }}
                      >
                        Acompanhe a alfabetização com cuidado, descobertas e passos que fazem
                        sentido.
                      </Text>
                    )}
                  </View>
                  <Mascot size={wide ? 230 : 102} />
                </View>
              </View>
            )}
            <View
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: tab === 'settings' ? 760 : undefined,
                gap: 20,
              }}
            >
              <View
                accessibilityRole="tablist"
                accessibilityLabel="Entrada e configurações"
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 6,
                  padding: 5,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.divider,
                }}
              >
                {(['login', 'settings'] as const).map((value) => {
                  const Icon = value === 'login' ? LogIn : Settings;
                  const selected = tab === value;
                  return (
                    <Pressable
                      key={value}
                      ref={(element) => {
                        tabRefs.current[value] = element;
                      }}
                      accessibilityRole="tab"
                      aria-selected={selected}
                      accessibilityState={{ selected }}
                      accessibilityLabel={value === 'login' ? 'Entrar' : 'Configurações'}
                      onPress={() => setTab(value)}
                      onFocus={() => setFocused(value)}
                      onBlur={() => setFocused(null)}
                      {...(Platform.OS === 'web'
                        ? {
                            onKeyDown: (event: any) => {
                              const key = event.nativeEvent.key;
                              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
                                event.preventDefault();
                                tabRefs.current[
                                  key === 'Home'
                                    ? 'login'
                                    : key === 'End'
                                      ? 'settings'
                                      : value === 'login'
                                        ? 'settings'
                                        : 'login'
                                ]?.focus();
                              }
                            },
                          }
                        : {})}
                      style={{
                        flexGrow: 1,
                        flexBasis: preferences.font_scale * fontScale > 1.2 ? '100%' : 0,
                        minHeight: 48,
                        padding: 10,
                        borderRadius: 12,
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: focused === value ? colors.focus : 'transparent',
                        backgroundColor: selected ? colors.primarySoft : colors.surface,
                      }}
                    >
                      <Icon
                        size={17}
                        color={selected ? colors.primary : colors.secondary}
                        aria-hidden={true}
                        accessible={Platform.OS === 'web' ? undefined : false}
                      />
                      <Text
                        style={{
                          color: selected ? colors.primary : colors.secondary,
                          fontFamily: tokens.fontSemibold,
                          fontSize: 12 * preferences.font_scale,
                        }}
                      >
                        {value === 'login' ? 'Entrar' : 'Configurações'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View
                style={{ display: tab === 'login' ? 'flex' : 'none', gap: 16 }}
                accessibilityElementsHidden={tab !== 'login'}
              >
                {children}
                <View style={{ alignItems: 'center' }}>
                  <Copy muted size="caption">
                    Versão de demonstração · Dados fictícios
                  </Copy>
                </View>
              </View>
              {tab === 'settings' && <QuickAccessibility />}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
