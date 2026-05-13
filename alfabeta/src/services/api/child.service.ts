import type { Child } from '@/@types/navigation';
import { childrenMock } from '@/mocks/children.mock';
import { IS_MOCK } from '@/utils/constants';

import { apiClient } from './client';

let localChildren = [...childrenMock];

/**
 * Child service abstraction over local mock or remote API.
 */
export const childService = {
  async list(): Promise<Child[]> {
    if (IS_MOCK) return localChildren;
    const response = await apiClient.get('/children');
    return response.data;
  },
  async getById(childId: string): Promise<Child | undefined> {
    if (IS_MOCK) return localChildren.find((child) => child.id === childId);
    const response = await apiClient.get(`/children/${childId}`);
    return response.data;
  },
  async create(child: Child): Promise<Child> {
    if (IS_MOCK) {
      localChildren = [...localChildren, child];
      return child;
    }
    const response = await apiClient.post('/children', child);
    return response.data;
  },
  async update(child: Child): Promise<Child> {
    if (IS_MOCK) {
      localChildren = localChildren.map((item) => (item.id === child.id ? child : item));
      return child;
    }
    const response = await apiClient.put(`/children/${child.id}`, child);
    return response.data;
  },
};
