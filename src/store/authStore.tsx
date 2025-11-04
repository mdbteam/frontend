import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  nombres: string;
  rol: string;
  foto_url?: string;
  genero?: string; 
  fecha_de_nacimiento?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        set({
          token,
          user, 
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('auth-storage'); 
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);