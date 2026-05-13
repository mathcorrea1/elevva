import { Platform } from 'react-native';

export const shadows = {
  level1: Platform.select({
    ios: { shadowColor: '#6d28d9', shadowOpacity: 0.07, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 2 },
    default: {},
  }),
  level2: Platform.select({
    ios: { shadowColor: '#6d28d9', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 4 },
    default: {},
  }),
  level3: Platform.select({
    ios: { shadowColor: '#6d28d9', shadowOpacity: 0.13, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    android: { elevation: 6 },
    default: {},
  }),
  level4: Platform.select({
    ios: { shadowColor: '#6d28d9', shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 8 },
    default: {},
  }),
  level5: Platform.select({
    ios: { shadowColor: '#6d28d9', shadowOpacity: 0.22, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
    android: { elevation: 12 },
    default: {},
  }),
};
