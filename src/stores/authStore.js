import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionExpiry: null,
      login: (userData) => {
        const expiryTime = Date.now() + parseInt(import.meta.env.VITE_SESSION_LOGOUT_TIME);
        set({
          user: userData.user,
          token: userData.token,
          isAuthenticated: true,
          sessionExpiry: expiryTime,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionExpiry: null,
        });
      },
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setSessionExpiry: (expiry) => set({ sessionExpiry: expiry }),
      updateOnboarding: (onboarding) => {
        set((state) => ({
          user: {
            ...state.user,
            onboarding_step: onboarding.onboarding_step !== undefined ? onboarding.onboarding_step : state.user?.onboarding_step,
            is_tour_completed: onboarding.onboarding_step !== undefined ? onboarding.onboarding_step > 0 : state.user?.onboarding_step > 0,
          }
        }))
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;