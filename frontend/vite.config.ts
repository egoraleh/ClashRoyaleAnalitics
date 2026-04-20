import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
            '@api': fileURLToPath(new URL('./src/shared/api', import.meta.url)),
            '@ui': fileURLToPath(new URL('./src/shared/components', import.meta.url)),
            '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
            '@utils': fileURLToPath(new URL('./src/shared/utils', import.meta.url)),
        },
    },
    build: {
        outDir: 'public/build',
        emptyOutDir: true,
    },
    server: {
        host: true,
        port: 5173,
    },
});
