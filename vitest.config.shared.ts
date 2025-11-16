import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export const createVitestConfig = (dirname: string) =>
  defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'build', '.turbo', 'old'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*', '**/dist/**', '**/__tests__/**', '**/old/**'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@extension/shared': path.resolve(dirname, './packages/shared'),
        '@extension/storage': path.resolve(dirname, './packages/storage'),
        '@extension/i18n': path.resolve(dirname, './packages/i18n'),
        '@extension/ui': path.resolve(dirname, './packages/ui'),
      },
    },
  });
