import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './index.css'

import VueFeather from 'vue-feather'

const app = createApp(App)
const socket_url = import.meta.env.VITE_SOCKET_URL

const pinia = createPinia()

pinia.use(({ store }) => {
    store.$router = markRaw(router)
})

app.use(pinia)

const socket = io(socket_url, {
    path: '/ws',
    autoConnect: true,
})

if ('serviceWorker' in navigator) {
    console.log('[info] Clearing service worker cache...')
    caches.keys().then(function (cacheNames) {
        cacheNames.forEach(function (cacheName) {
            console.log(cacheName, 'cacheName')
            caches.delete(cacheName)
        })
    })
}

app.use(VueSocketIOExt, socket)
app.use(router)
app.component(VueFeather.name, VueFeather)

app.mount('#app')
