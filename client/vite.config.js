// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SAD Section 13.1: Vite provides fast HMR in development and optimized
// production builds. The dev-server proxy below is local convenience only —
// production uses VITE_API_BASE_URL (Section 5.2) via axiosInstance.js,
// added in a later module.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
});
