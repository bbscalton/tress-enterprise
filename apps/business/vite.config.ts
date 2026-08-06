import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/tress-enterprise/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['alarm.mp3', 'favicon.svg'],
      manifest: {
        name: 'Tress Enterprise Business',
        short_name: 'TressBiz',
        description: 'Tress Enterprise fleet rental management',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { port: 5173 },
});
