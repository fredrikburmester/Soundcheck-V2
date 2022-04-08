import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './index.css'

const app = createApp(App)
const socket_url = import.meta.env.VITE_SOCKET_URL

const pinia = createPinia()

pinia.use(({ store }) => {
    store.$router = markRaw(router)
})

app.use(pinia)

var socket

socket = io(socket_url, {
    path: '/ws',
    autoConnect: true,
})

app.use(VueSocketIOExt, socket)

app.use(router)

app.mount('#app')
