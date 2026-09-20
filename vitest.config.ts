import { defineConfig } from 'vitest/config';
import path from 'path';

// Standalone test config — deliberately does NOT import vite.config.ts so the
// Tailwind and PWA plugins stay out of the test runner.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
