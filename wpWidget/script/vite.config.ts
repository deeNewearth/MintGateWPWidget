import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import polyfillNode from 'rollup-plugin-polyfill-node';

//https://stackblitz.com/edit/vitejs-vite-tlcezm?file=vite.config.ts&terminal=dev

export default defineConfig({
    plugins: [
      tsconfigPaths(),
      polyfillNode()
    ],
    optimizeDeps: {
      //exclude: ['dragula'] // <= The libraries that need shimming should be excluded from dependency optimization.
    },
    define: {
      'process.env': {}
    }
  })