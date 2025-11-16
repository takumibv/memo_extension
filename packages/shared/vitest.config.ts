import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.turbo'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*', '**/dist/**', '**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@extension/shared': path.resolve(__dirname, './'),
      '@extension/storage': path.resolve(__dirname, '../storage'),
      '@extension/i18n': path.resolve(__dirname, '../i18n'),
      '@extension/test-utils': path.resolve(__dirname, '../test-utils'),
    },
  },
});
