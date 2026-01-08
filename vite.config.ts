import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 核心修复：移除 '/magazine' 子路径，统一使用相对路径
    // 这能确保无论在开发环境(localhost)还是生产环境(file://)，资源路径都能正确解析。
    const base = './';

    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        electron({
          entry: 'electron/main.ts',
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});