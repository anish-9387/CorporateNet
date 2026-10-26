import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
    globalSetup: ['./src/test-global-setup.ts'],
    fileParallelism: false,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
