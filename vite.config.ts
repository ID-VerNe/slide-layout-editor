import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isElectron = mode === 'electron' || process.env.ELECTRON === 'true';
    const base = './';

    return {
      base,
      server: {
        port: 43101,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        visualizer({
          open: process.env.CI ? false : true,
          gzipSize: true,
          brotliSize: true,
        }),
        electron([
          {
            // Main-Process entry file of the Electron App.
            entry: 'electron/main.ts',
            vite: {
              build: {
                rollupOptions: {
                  external: ['adm-zip', 'sharp', 'electron', 'path', 'fs', 'crypto'],
                },
              },
            },
          },
          {
            entry: 'electron/preload.ts',
          },
        ]),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              'vendor-motion': ['framer-motion'],
              'vendor-utils': ['zustand', 'lucide-react'],
              'vendor-katex': ['katex'],
            }
          }
        }
      }
    };
});
