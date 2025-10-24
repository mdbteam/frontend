import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/prestadores': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/prestadores/, '/prestadores'),
      },
      '/api/postulaciones': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/postulaciones/, '/postulaciones'),
      },
      '/api/trabajos': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/trabajos/, '/trabajos'),
      },
      '/api/users': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/users/, '/users'),
      },
      '/api/profile': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/profile/, '/profile'),
      },
      '/api': {
        target: 'https://auth-service-1-8301.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})