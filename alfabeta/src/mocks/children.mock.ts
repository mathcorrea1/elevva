import type { Child } from '@/@types/navigation';

import { mockChildren } from './auth.mock';

export const childrenMock: Child[] = mockChildren.map((child) => ({
  ...child,
  activities: [],
}));
