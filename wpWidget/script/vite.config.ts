import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

//https://stackblitz.com/edit/vitejs-vite-tlcezm?file=vite.config.ts&terminal=dev

export default defineConfig({
    plugins: [tsconfigPaths()],
    define: {
      'process.env': {}
    }
  })