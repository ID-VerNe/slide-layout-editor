import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
      'node_modules/',
      'src/setupTests.ts',
      'src/**/*.d.ts',
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**',
      'dist/',
      'dist-electron/',
      'public/',
      '**/*.config.*',
      // Pure data declaration files (no logic, just template schemas)
      'src/templates/schemas/index.ts',
    ],
    thresholds: {
      // Lock current coverage so future regressions fail CI.
      // Tune upward as more tests are added.
      statements: 55,
      branches: 37,
      functions: 42,
      lines: 57,
    },
  },
});
