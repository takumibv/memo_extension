import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Background scriptはNode環境
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.turbo'],
    passWithNoTests: true, // テストファイルがなくてもエラーにしない
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*', '**/dist/**', '**/__tests__/**', 'manifest.js'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@extension/shared': path.resolve(__dirname, '../packages/shared'),
      '@extension/storage': path.resolve(__dirname, '../packages/storage'),
      '@extension/i18n': path.resolve(__dirname, '../packages/i18n'),
      '@extension/test-utils': path.resolve(__dirname, '../packages/test-utils'),
    },
  },
});
