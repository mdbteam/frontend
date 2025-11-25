import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

// --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
// Esta interfaz ahora coincide con el endpoint 'GET /users/me'
export interface User {
  id: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  rut: string;
  correo: string;
  direccion: string | null;
  rol: string;
  foto_url: string | null; // Lo ponemos como 'null' para ser compatible con todo
  genero: string | null;
  fecha_nacimiento: string | null;
  // Añadimos 'telefono' si también viene en GET /users/me
  telefono?: string | null; 
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void; // Para actualizar el perfil
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          get().logout();
          return;
        }

        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Usamos el endpoint correcto 'GET /users/me'
          const { data } = await axios.get<User>('/api/users/me'); 
          set({ user: data, isAuthenticated: true });
        } catch (error) {
          console.error("Error en checkAuth, deslogueando:", error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);