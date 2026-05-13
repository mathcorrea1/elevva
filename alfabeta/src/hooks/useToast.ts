import { useAppStore } from '@/store/app.store';

/**
 * Global toast trigger hook.
 */
export const useToast = () => {
  const showToast = useAppStore((state) => state.showToast);
  const clearToast = useAppStore((state) => state.clearToast);
  const toast = useAppStore((state) => state.toast);

  return { showToast, clearToast, toast };
};
