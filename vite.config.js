import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import plainText from 'vite-plugin-plain-text';


// https://vitejs.dev/config/
export default defineConfig({
    root: 'vite-app',
    base: '/',
    plugins: [
        plainText(/\.md$/),
        vue(),
    ],
    build: {
        outDir: '../dist',
    },
});
