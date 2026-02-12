import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback-middleware',
      apply: 'serve',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (req.method === 'GET' && req.url === '/') {
              req.url = '/index.html';
            }
            next();
          });
        };
      }
    }
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
