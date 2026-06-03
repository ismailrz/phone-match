import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/db/seed.ts',
        'src/db/index.ts',
        'src/db/schema.ts',
        'src/server.ts',
        'src/app/index.ts',
        'src/config/index.ts',
        'src/repositories/**',
        'src/tools/**',
        'src/schemas/**',
        'src/prompts/**',
        'src/modules/recommendations/types.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    conditions: ['node'],
  },
});
