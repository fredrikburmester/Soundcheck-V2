import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import { useUserStore } from '@/stores/user'

import App from './App.vue'
import router from './router'

import './index.css'

const app = createApp(App)
app.use(createPinia())

// Create socket connection
// const userStore = useUserStore()

// var id = userStore.getId

// if (id == null || id == '' || id === undefined || id.length == 0) {
//     console.log('no id')
//     const new_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
//     userStore.setId(new_id)
// }
const socket_url = process.env.VUE_APP_SOCKET_URL
const socket = io(socket_url)

app.use(VueSocketIOExt, socket)
app.use(router)

app.mount('#app')
