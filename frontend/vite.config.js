import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import eslintPlugin from 'vite-plugin-eslint'

import { VitePWA } from 'vite-plugin-pwa'

export const hash = Math.floor(Math.random() * 90000) + 10000

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    return {
        plugins: [
            vue(),
            vueJsx(),
            eslintPlugin(),
            VitePWA({
                includeAssets: ['favicon.png', 'robots.txt', 'apple-touch-icon.png'],
                manifest: {
                    name: 'Soundcheck',
                    short_name: 'Soundcheck',
                    description: 'Soundcheck is a music quiz where you and your friends can guess each others favorite songs!',
                    theme_color: '#000000',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },
                    ],
                },
            }),
        ],
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
