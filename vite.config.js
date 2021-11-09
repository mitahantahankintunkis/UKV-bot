import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    root: 'vite-app',
    base: '',
    plugins: [vue()],
    build: {
        outDir: '../dist',
    },
})
