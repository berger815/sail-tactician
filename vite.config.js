import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'tactician-core',
    },
  },
  test: {
    environment: 'node',
    coverage: { reporter: ['text', 'html'] },
  },
});
