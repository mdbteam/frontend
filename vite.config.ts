import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      
      // --- Regla 1: Auth Service (Login/Registro) ---
      '/api/auth': {
        target: 'https://auth-service-1-8301.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },
      
      // --- Regla 2: Calendario Service (¡CORREGIDA!) ---
      '/api/calendario': {
        target: 'https://calendario-service-u5f6.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/calendario/, ''), // Se borró '/calendario'
      },

      // --- Regla 3: Communication Service (Historial de Chat) ---
      '/api/chat': {
        target: 'https://communication-service-akj6.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/chat'),
      },

      // --- Regla 4: Provider Service (Todo lo demás) ---
      '/api': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})