import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import eslintPlugin from 'vite-plugin-eslint'

export const hash = Math.floor(Math.random() * 90000) + 10000

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    return {
        plugins: [vue(), vueJsx(), eslintPlugin()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            host: true,
            port: env.VITE_PORT,
        },
        build: {
            rollupOptions: {
                output: {
                    entryFileNames: `[name]` + hash + `.js`,
                    chunkFileNames: `[name]` + hash + `.js`,
                    assetFileNames: `[name]` + hash + `.[ext]`,
                },
            },
        },
    }
})
