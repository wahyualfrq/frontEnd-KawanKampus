import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Actions (backward-compatible) ──────────────────────
      /** Called by Login/Register pages after successful API call */
      login: (userData, token) =>
        set({ user: userData, token, isAuthenticated: true, error: null, isLoading: false }),

      /** Clears all auth state; called by Logout button */
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false }),

      // ── UI helpers (used internally by auth pages) ──────────
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist essential auth data — never persist loading/error UI state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
