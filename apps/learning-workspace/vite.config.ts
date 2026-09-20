import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ilp/design-tokens/styles.css': fileURLToPath(
        new URL('../../packages/design-tokens/src/styles.css', import.meta.url),
      ),
      '@ilp/shared-ui/styles.css': fileURLToPath(
        new URL('../../packages/shared-ui/src/styles.css', import.meta.url),
      ),
      '@ilp/shared-ui': fileURLToPath(
        new URL('../../packages/shared-ui/src/index.ts', import.meta.url),
      ),
      '@ilp/lesson-schema': fileURLToPath(
        new URL('../../packages/lesson-schema/src/index.ts', import.meta.url),
      ),
      '@ilp/lesson-player': fileURLToPath(
        new URL('../../packages/lesson-player/src/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
});
