import { fileURLToPath, URL } from 'node:url'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nekotonWasmVite } from 'nekoton-wasm-vite'

export default defineConfig({
  plugins: [
    nekotonWasmVite(),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer/', 'Buffer']
        }),
      ]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
})
