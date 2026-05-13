import type { Child } from '@/@types/navigation';
import { childService } from '@/services/api/child.service';

import { create } from 'zustand';

interface ChildState {
  children: Child[];
  selectedChildId: string | null;
  loading: boolean;
  fetchChildren: () => Promise<void>;
  addChild: (child: Child) => Promise<void>;
  updateChild: (child: Child) => Promise<void>;
  selectChild: (childId: string) => void;
}

export const useChildStore = create<ChildState>((set, get) => ({
  children: [],
  selectedChildId: null,
  loading: false,
  fetchChildren: async () => {
    set({ loading: true });
    const children = await childService.list();
    set({ children, loading: false });
  },
  addChild: async (child) => {
    await childService.create(child);
    set({ children: [...get().children, child] });
  },
  updateChild: async (child) => {
    await childService.update(child);
    set({ children: get().children.map((item) => (item.id === child.id ? child : item)) });
  },
  selectChild: (childId) => set({ selectedChildId: childId }),
}));
