import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode: _mode }) => {
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
          open: process.env.ANALYZE === 'true',
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
