import { create } from 'zustand';
import { User, Team } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  quickLogin: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('caa_token'),
  isAuthenticated: !!localStorage.getItem('caa_token'),
  isLoading: false,
  error: null,

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(email, pass);
      localStorage.setItem('caa_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  quickLogin: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const pass = email.includes('admin') ? 'admin123' : 'team123';
      const data = await api.login(email, pass);
      localStorage.setItem('caa_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('caa_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('caa_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const data = await api.getCurrentUser();
      set({ user: data.user, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('caa_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
