import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load properly on GitHub Pages and any subpath
  server: {
    port: 5173,
    host: true,
  },
});
