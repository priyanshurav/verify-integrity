import { defineConfig } from 'tsup';
import { version } from './package.json';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  minify: true,
  define: {
    __CLI_VERSION__: JSON.stringify(version),
  },
});
