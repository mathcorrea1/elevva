import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const tokens = {
  fontFamily: 'Poppins_400Regular',
  fontMedium: 'Poppins_500Medium',
  fontSemibold: 'Poppins_600SemiBold',
  fontHeading: 'Poppins_700Bold',
  fontDisplay: 'Poppins_800ExtraBold',
  space: { sm: 8, md: 12, lg: 20, xl: 32 },
  radius: { control: 12, card: 16 },
  touchTarget: 48,
};

export type Preferences = {
  theme: 'system' | 'light' | 'dark';
  contrast: boolean;
  font_scale: 1 | 1.25 | 1.5;
  read_enabled: boolean;
  reduce_motion: boolean;
};
export const defaults: Preferences = {
  theme: 'system',
  contrast: false,
  font_scale: 1,
  read_enabled: true,
  reduce_motion: false,
};
const light = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  text: '#142239',
  secondary: '#536278',
  primary: '#185DCE',
  onPrimary: '#FFFFFF',
  border: '#778DA6',
  error: '#A51727',
  success: '#17613C',
  focus: '#A64500',
  divider: '#E2E8F1',
  primarySoft: '#EAF1FF',
  mutedSurface: '#F3F6FB',
  accent: '#FFCE66',
  onAccent: '#493000',
  hero: '#123D84',
  heroEnd: '#185DCE',
  onHero: '#FFFFFF',
  heroMuted: '#D6E5FF',
  shadow: '#182D52',
};
const dark = {
  background: '#0B1726',
  surface: '#15273B',
  text: '#F2F7FF',
  secondary: '#C3D3E8',
  primary: '#9CCBFF',
  onPrimary: '#09213D',
  border: '#8AABC9',
  error: '#FFB4BA',
  success: '#8EE2B0',
  focus: '#FFD29A',
  divider: '#34465C',
  primarySoft: '#213B5E',
  mutedSurface: '#1A3048',
  accent: '#FFCE66',
  onAccent: '#493000',
  hero: '#203F65',
  heroEnd: '#284F7C',
  onHero: '#FFFFFF',
  heroMuted: '#D6E5FF',
  shadow: '#000000',
};
export function palette(isDark: boolean, contrast: boolean) {
  const base = isDark ? dark : light;
  return contrast
    ? {
        ...base,
        background: isDark ? '#000000' : '#FFFFFF',
        surface: isDark ? '#000000' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
        secondary: isDark ? '#FFFFFF' : '#000000',
        border: isDark ? '#FFFFFF' : '#000000',
        primary: isDark ? '#9CDCFF' : '#003E80',
        divider: isDark ? '#FFFFFF' : '#000000',
        primarySoft: isDark ? '#000000' : '#FFFFFF',
        mutedSurface: isDark ? '#000000' : '#FFFFFF',
        hero: isDark ? '#000000' : '#003E80',
        heroEnd: isDark ? '#000000' : '#003E80',
      }
    : base;
}
type ThemeContext = {
  colors: typeof light;
  preferences: Preferences;
  dark: boolean;
  reducedMotion: boolean;
  update: (patch: Partial<Preferences>) => void;
  scope: (id: string | null, remote?: Partial<Preferences>) => void;
};
const Context = createContext<ThemeContext | null>(null);
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preferences, setPreferences] = useState(defaults);
  const [owner, setOwner] = useState('device');
  const ownerRef = useRef('device');
  const devicePreferences = useRef<Preferences>(defaults);
  const [reducedMotion, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    void AsyncStorage.getItem('eleva.preferences.device')
      .then((v) => {
        if (v && ownerRef.current === 'device') {
          try {
            devicePreferences.current = { ...defaults, ...JSON.parse(v) };
            setPreferences(devicePreferences.current);
          } catch {
            /* Ignore corrupt local preference. */
          }
        }
      })
      .catch(() => undefined);
    return () => sub.remove();
  }, []);
  const update = (patch: Partial<Preferences>) => {
    setPreferences((old) => {
      const next = { ...old, ...patch };
      if (owner === 'device') devicePreferences.current = next;
      void AsyncStorage.setItem('eleva.preferences.' + owner, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
  };
  const scope = (id: string | null, remote: Partial<Preferences> = {}) => {
    const nextOwner = id || 'device';
    ownerRef.current = nextOwner;
    setOwner(nextOwner);
    setPreferences({ ...devicePreferences.current, ...remote });
    void AsyncStorage.getItem('eleva.preferences.' + nextOwner)
      .then((value) => {
        if (value && ownerRef.current === nextOwner) {
          try {
            setPreferences({ ...devicePreferences.current, ...remote, ...JSON.parse(value) });
          } catch {
            /* Fall back to server preference. */
          }
        }
      })
      .catch(() => undefined);
  };
  const isDark =
    preferences.theme === 'dark' || (preferences.theme === 'system' && system === 'dark');
  return (
    <Context.Provider
      value={{
        colors: palette(isDark, preferences.contrast),
        preferences,
        dark: isDark,
        reducedMotion: reducedMotion || preferences.reduce_motion,
        update,
        scope,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTheme() {
  const value = useContext(Context);
  if (!value) throw new Error('ThemeProvider required');
  return value;
}
/** Child presentation applies only inside the executor; it never overwrites adult preferences. */
export function PresentationScope({
  fontScale,
  children,
}: PropsWithChildren<{ fontScale?: 1 | 1.25 | 1.5 }>) {
  const parent = useTheme();
  return (
    <Context.Provider
      value={{
        ...parent,
        preferences: {
          ...parent.preferences,
          font_scale: Math.max(parent.preferences.font_scale, fontScale || 1) as 1 | 1.25 | 1.5,
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
