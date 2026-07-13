import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    lib: {
      entry: 'src/index.js',
      name: 'TacticianCore',
      formats: ['es', 'iife'],
      fileName: (format) => format === 'iife' ? 'tactician-core.iife.js' : 'tactician-core.js',
    },
  },
  test: {
    environment: 'node',
    coverage: { reporter: ['text', 'html'] },
  },
});
