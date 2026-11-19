import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Platform, useWindowDimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme, tokens } from '@/shared/theme/ThemeProvider';
import { House, Route, Users, UserRound, ChartColumn, School } from 'lucide-react-native';
export function TabNavigation({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors, preferences } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const sidebar =
    Platform.OS === 'web' && width >= 1000 && preferences.font_scale * fontScale <= 1.25;
  const large = preferences.font_scale * fontScale > 1.25 || width < 350;
  const columns = large ? 3 : 5;
  const refs = useRef<(View | null)[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  if (
    ['Execute', 'LessonPlayer'].includes(
      getFocusedRouteNameFromRoute(state.routes[state.index]) || '',
    )
  )
    return null;
  function keyboard(index: number, e: any) {
    const key = e.nativeEvent.key;
    const offset =
      key === 'ArrowRight' || key === 'ArrowDown'
        ? 1
        : key === 'ArrowLeft' || key === 'ArrowUp'
          ? -1
          : 0;
    if (!offset && key !== 'Home' && key !== 'End') return;
    e.preventDefault();
    const next =
      key === 'Home'
        ? 0
        : key === 'End'
          ? state.routes.length - 1
          : (index + offset + state.routes.length) % state.routes.length;
    refs.current[next]?.focus();
  }
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Destinos principais"
      style={
        sidebar
          ? {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 240,
              padding: 20,
              paddingTop: 32,
              gap: 10,
              backgroundColor: colors.surface,
              borderRightWidth: 1,
              borderColor: colors.divider,
            }
          : {
              flexDirection: 'row',
              flexWrap: 'wrap',
              borderTopWidth: 1,
              borderColor: colors.divider,
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 4),
            }
      }
    >
      {sidebar && (
        <View style={{ padding: 14, marginBottom: 22, gap: 6 }}>
          <Text style={{ color: colors.primary, fontFamily: tokens.fontDisplay, fontSize: 34 }}>
            eleva.
          </Text>
          <Text style={{ color: colors.secondary, fontFamily: tokens.fontFamily, fontSize: 12 }}>
            Cada descoberta importa.
          </Text>
        </View>
      )}
      {state.routes.map((route, index) => {
        const selected = index === state.index;
        const label = descriptors[route.key].options.title || route.name;
        const Icon =
          (
            {
              Inicio: House,
              Estudantes: Users,
              Escolas: School,
              Trilhas: Route,
              Relatórios: ChartColumn,
              Perfil: UserRound,
            } as Record<string, typeof House>
          )[route.name] || House;
        return (
          <Pressable
            key={route.key}
            ref={(el) => {
              refs.current[index] = el;
            }}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onFocus={() => setFocused(route.key)}
            onBlur={() => setFocused(null)}
            {...(Platform.OS === 'web' ? { onKeyDown: (e: any) => keyboard(index, e) } : {})}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                const destinations: Record<string, string> = {
                  Inicio: 'Home',
                  Estudantes: 'Children',
                  Escolas: 'Schools',
                  Trilhas: 'Trails',
                  Relatórios: 'Reports',
                  Perfil: 'Profile',
                };
                navigation.navigate(route.name, { screen: destinations[route.name] || 'Home' });
              }
            }}
            style={({ pressed }) => ({
              width: sidebar ? '100%' : `${100 / columns}%`,
              minHeight: sidebar ? 60 : 68,
              flexDirection: sidebar ? 'row' : 'column',
              gap: sidebar ? 14 : 4,
              paddingHorizontal: sidebar ? 16 : 2,
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: sidebar ? 'flex-start' : 'center',
              borderWidth: 2,
              borderColor: focused === route.key ? colors.focus : 'transparent',
              borderRadius: sidebar ? 18 : 14,
              backgroundColor: selected ? colors.primarySoft : colors.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon size={22} color={selected ? colors.primary : colors.secondary} />
            <Text
              style={{
                fontFamily: selected ? tokens.fontSemibold : tokens.fontMedium,
                fontSize: (sidebar ? 14 : 12) * preferences.font_scale,
                color: selected ? colors.primary : colors.text,
                textAlign: 'center',
                flexShrink: 1,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
