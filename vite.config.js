import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        dream: resolve(__dirname, 'src/dream.html'),
        qq_space: resolve(__dirname, 'src/qq_space.html'),
      }
    }
  }
});
