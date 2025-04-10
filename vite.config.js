import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url'; // Import necessary Node.js modules

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    // enable jest-like global test APIs
    globals: true,
    // simulate DOM with jsdom
    environment: 'jsdom',
    // support vue component testing
    deps: {
      inline: ['@vue/test-utils'],
    },
  },
})
