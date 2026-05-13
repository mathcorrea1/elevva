import { borderRadius } from './borderRadius';
import { colors } from './colors';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type AppTheme = typeof theme;
