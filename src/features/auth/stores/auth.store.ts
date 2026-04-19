import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth.types';
import { AUTH_ROUTES } from '../constants/auth.constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User) => void;
  setUser: (user: User | null) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
          isLoading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        sessionStorage.clear();
        localStorage.setItem('auth_logout', Date.now().toString());
        localStorage.removeItem('auth_logout');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

// Sync logout entre abas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_logout') {
      useAuthStore.getState().clearAuth();
      window.location.href = AUTH_ROUTES.login;
    }
  });
}
