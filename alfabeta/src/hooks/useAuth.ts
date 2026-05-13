import { useAuthStore } from '@/store/auth.store';

/**
 * Hook facade for auth actions and flags.
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const onboardingDone = useAuthStore((state) => state.onboardingDone);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const logout = useAuthStore((state) => state.logout);
  const hydrate = useAuthStore((state) => state.hydrate);
  const setOnboardingDone = useAuthStore((state) => state.setOnboardingDone);

  return {
    user,
    isAuthenticated,
    isBootstrapping,
    onboardingDone,
    login,
    register,
    forgotPassword,
    logout,
    hydrate,
    setOnboardingDone,
  };
};
