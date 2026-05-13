import type { ChildActivity } from '@/@types/navigation';
import { activitiesMock } from '@/mocks/activities.mock';
import { IS_MOCK } from '@/utils/constants';

import { apiClient } from './client';

/**
 * Activity service with filters and completion updates.
 */
export const activityService = {
  async list(): Promise<ChildActivity[]> {
    if (IS_MOCK) {
      return activitiesMock.map((item) => ({
        ...item,
        createdAt: new Date().toISOString(),
      })) as ChildActivity[];
    }
    const response = await apiClient.get('/activities');
    return response.data;
  },
  async complete(activityId: string): Promise<void> {
    if (IS_MOCK) return;
    await apiClient.patch(`/activities/${activityId}`, { completed: true });
  },
};
