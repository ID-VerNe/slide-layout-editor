import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'stats.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
    },
  },
  // 第一批:已清理完成的核心数据流与模板渲染层,any 回退即 CI 失败
  // 测试目录保留 warn,允许 fixture 用 any 过渡
  {
    files: [
      'src/pages/**/*.ts',
      'src/pages/**/*.tsx',
      'src/store/**/*.ts',
      'src/services/**/*.ts',
      'src/templates/registry.ts',
      'src/templates/schemas/expressionEvaluator.ts',
      'src/templates/schemas/renderer/**/*.ts',
      'src/templates/schemas/renderer/**/*.tsx',
      'src/templates/schemas/zIndexResolver.ts',
      'src/templates/schemas/types.ts',
      'src/types/**/*.ts',
      'src/utils/comparison.ts',
      'src/utils/logger.ts',
      'src/utils/migrations/**/*.ts',
      'src/utils/imageGeometry.ts',
      'src/utils/storage/projectDb.ts',
      'src/components/ui/slide/hooks/**/*.ts',
      'src/components/editor/zine/zineStyleUtils.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // 测试 fixture 与未完成清理的目录仍保留 warn
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
