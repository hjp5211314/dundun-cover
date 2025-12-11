import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'esbuild',
    target: 'es2018',
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    cssMinify: true
  }
})
