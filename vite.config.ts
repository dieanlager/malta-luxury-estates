import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    /*
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n': ['i18next', 'react-i18next', 'i18next-http-backend'],
          'supabase': ['@supabase/supabase-js'],
          'maps': ['mapbox-gl', 'react-map-gl'],
          'ui': ['lucide-react', 'motion', 'motion-react'],
        }
      }
    },
    */
    chunkSizeWarningLimit: 1000,
  },
});
