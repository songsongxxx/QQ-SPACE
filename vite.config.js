// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // 使用相对路径，确保打包后链接不出错
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        qq_space: resolve(__dirname, 'qq_space.html'),
        dream: resolve(__dirname, 'dream.html'),
        // 你可以继续加更多页面：
        audrey: resolve(__dirname, 'audrey_home.html'),
        george: resolve(__dirname, 'george_home.html'),
        yewen: resolve(__dirname, 'yewen_home.html'),
        ahha: resolve(__dirname, 'ahha.html'),
      }
    }
  }
});
