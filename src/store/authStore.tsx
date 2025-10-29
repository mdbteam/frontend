import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_SERVICE = 'https://auth-service-1-8301.onrender.com'

interface User {
  id: string;
  nombres: string;
  rol: string;
  foto_url?: string;
  genero?: string; // <-- AÑADIR
  fecha_de_nacimiento?: string; // <-- AÑADIR
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true, 

      login: (token, user) => {
        set({
          token,
          user, 
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false, 
        });
        // No necesitas borrar 'auth-storage' manualmente, 'persist' lo maneja
      },

      // Esta función hace una llamada de red para validar el token
      checkAuth: async () => {
        const token = get().token;

        if (!token) {
          set({ isAuthenticated: false, isLoading: false, user: null });
          return;
        }

        try {
          const response = await fetch(`${AUTH_SERVICE}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Token inválido o expirado');
          }

          const userData: User = await response.json();
          
          set({ user: userData, isAuthenticated: true, isLoading: false });

        } catch (error) {
          console.error("Fallo al verificar el token:", error);
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage', // Nombre del item en localStorage
    }
  )
);