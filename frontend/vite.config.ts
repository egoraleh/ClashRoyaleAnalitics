import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
            '@api': fileURLToPath(new URL('./src/shared/api', import.meta.url)),
            '@ui': fileURLToPath(new URL('./src/shared/components', import.meta.url)),
        },
    },
    server: {
        host: true,
        port: 5173,
    },
});
