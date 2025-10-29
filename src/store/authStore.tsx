import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Ya no necesitamos las URLs de Render aquí, usamos el proxy de Vercel/Vite
// const AUTH_SERVICE = '...'; 
// const PROVIDER_SERVICE_URL = '...';

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
 isAuthenticated: boolean; // Usaremos 'isAuthenticated' para ser consistentes
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
   },

   checkAuth: async () => {
    const token = get().token;

    if (!token) {
     set({ isAuthenticated: false, isLoading: false, user: null });
     return;
    }

    try {
     const response = await fetch('/api/users/me', { 
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
   name: 'auth-storage', 
  }
 )
);