import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import plainText from 'vite-plugin-plain-text';



// https://vitejs.dev/config/
export default defineConfig({
    root: 'vite-app',
    base: '/',
    plugins: [
        vue(),
        plainText(/.+\.md$/g),
    ],
    build: {
        outDir: '../dist',
    },
});
