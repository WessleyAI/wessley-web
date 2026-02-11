import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const webModules = resolve(__dirname, './node_modules')

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
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    deps: {
      optimizer: {
        web: {
          include: [
            '@testing-library/react',
            '@testing-library/jest-dom',
            '@testing-library/dom',
            '@tabler/icons-react',
            'react-dom',
            'react-dom/client',
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'react': resolve(webModules, 'react'),
      'react-dom': resolve(webModules, 'react-dom'),
      'react/jsx-runtime': resolve(webModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime': resolve(webModules, 'react/jsx-dev-runtime'),
    },
  },
})
