import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
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
      statements: 62,
      branches: 45,
      functions: 49,
      lines: 63,
    },
  },
});
