import type { GuidanceItem } from '@/mocks/guidance.mock';
import { guidanceMock } from '@/mocks/guidance.mock';
import { IS_MOCK } from '@/utils/constants';

import { apiClient } from './client';

/**
 * Pedagogical guidance service.
 */
export const guidanceService = {
  async list(): Promise<GuidanceItem[]> {
    if (IS_MOCK) return guidanceMock;
    const response = await apiClient.get('/guidance');
    return response.data;
  },
  async getById(id: string): Promise<GuidanceItem | undefined> {
    if (IS_MOCK) return guidanceMock.find((item) => item.id === id);
    const response = await apiClient.get(`/guidance/${id}`);
    return response.data;
  },
};
