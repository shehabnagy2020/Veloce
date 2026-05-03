import { create } from 'zustand';
import { apiFetch, setToken, clearToken } from '../services/api';

interface User {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  language: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('veloce_token'),
  isLoading: false,

  login: async (email, password) => {
    const data = await apiFetch<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    set({ isAuthenticated: true });
  },

  register: async (email, password, display_name) => {
    const data = await apiFetch<{ access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name }),
    });
    setToken(data.access_token);
    set({ isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await apiFetch<User>('/auth/me');
      set({ user, isAuthenticated: true });
    } catch {
      clearToken();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));