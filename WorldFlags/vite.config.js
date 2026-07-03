import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-180.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'World Flags',
        short_name: 'Flags',
        description: 'Learn the flags of the world',
        theme_color: '#0f766e',
        background_color: '#101418',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://flagcdn.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'flag-images',
              expiration: {
                maxEntries: 400,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: '/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
