import { useMemo } from 'react';

import { useChildStore } from '@/store/child.store';

/**
 * Hook facade for children entities and computed selectors.
 */
export const useChild = () => {
  const children = useChildStore((state) => state.children);
  const loading = useChildStore((state) => state.loading);
  const selectedChildId = useChildStore((state) => state.selectedChildId);
  const fetchChildren = useChildStore((state) => state.fetchChildren);
  const addChild = useChildStore((state) => state.addChild);
  const updateChild = useChildStore((state) => state.updateChild);
  const selectChild = useChildStore((state) => state.selectChild);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId),
    [children, selectedChildId],
  );

  return {
    children,
    loading,
    selectedChild,
    fetchChildren,
    addChild,
    updateChild,
    selectChild,
  };
};
