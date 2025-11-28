import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chatbot': {
        target: 'https://ai-search-service-3a39.onrender.com', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },

      '/api/auth': {
        target: 'https://auth-service-1-8301.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },
      '/api/calendario': {
        target: 'https://calendario-service-u5f6.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/calendario/, ''),
      },
      '/api/chat': {
        target: 'https://communication-service-akj6.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/chat'),
      },
      '/api': {
        target: 'https://provider-service-mjuj.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
