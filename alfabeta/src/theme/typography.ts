export const typography = {
  fonts: {
    primary: 'Poppins_400Regular',
    primaryMedium: 'Poppins_500Medium',
    primarySemiBold: 'Poppins_600SemiBold',
    primaryBold: 'Poppins_700Bold',
    primaryExtraBold: 'Poppins_800ExtraBold',
    technical: 'Poppins_500Medium',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  /* Absolute line heights (px) for common font sizes */
  lineHeights: {
    xs: 16,
    sm: 19,
    base: 22,
    lg: 25,
    xl: 29,
    '2xl': 33,
    '3xl': 40,
    hero: 52,
  },
  letterSpacing: {
    tightest: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
    widest: 1.2,
    caps: 0.8,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  } as const,
};

