import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so dist/ can be served from any folder at the venue.
  base: './',
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
