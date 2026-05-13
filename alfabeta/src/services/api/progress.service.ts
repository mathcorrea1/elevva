import type { Child } from '@/@types/navigation';
import { IS_MOCK } from '@/utils/constants';

import { apiClient } from './client';

/**
 * Progress reporting service.
 */
export const progressService = {
  async report(childId: string): Promise<{ child?: Child; timeline: Array<{ date: string; progress: number }> }> {
    if (IS_MOCK) {
      return {
        timeline: [
          { date: '2026-01-15', progress: 22 },
          { date: '2026-02-15', progress: 37 },
          { date: '2026-03-15', progress: 49 },
          { date: '2026-04-15', progress: 61 },
        ],
      };
    }
    const response = await apiClient.get(`/children/${childId}/progress`);
    return response.data;
  },
};
