import { defineConfig } from 'vitest/config';

// Tes logika murni (src/lib/*.test.ts) tidak butuh plugin SvelteKit/PWA.
export default defineConfig({ test: { include: ['src/**/*.test.ts'], environment: 'node' } });
