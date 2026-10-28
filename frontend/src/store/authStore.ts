import { create } from 'zustand';
import type { UserResponse } from '../services/authService';

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserResponse, token: string) => void;
  logout: () => void;
}

const getStoredToken = (): string | null => {
  return localStorage.getItem('projectpulse_token');
};

const getStoredUser = (): UserResponse | null => {
  try {
    const raw = localStorage.getItem('projectpulse_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),

  login: (user: UserResponse, token: string) => {
    localStorage.setItem('projectpulse_token', token);
    localStorage.setItem('projectpulse_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('projectpulse_token');
    localStorage.removeItem('projectpulse_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
