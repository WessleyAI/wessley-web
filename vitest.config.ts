import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/node_modules/**',
        'src/types/**',
        'src/**/*.d.ts',
      ],
      thresholds: {
        // Start with low thresholds, increment as coverage improves
        // Target: 70% for lines, functions, branches, statements
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') },
      // Fix #58: monorepo root hoists react-dom@18 (peer dep from @dnd-kit,
      // radix, etc.) but web/ needs React 19. Pin all react resolution to
      // web/node_modules so @testing-library/react and other deps use React 19.
      { find: /^react-dom($|\/)/, replacement: resolve(__dirname, './node_modules/react-dom$1') },
      { find: /^react($|\/)/, replacement: resolve(__dirname, './node_modules/react$1') },
    ],
  },
})
