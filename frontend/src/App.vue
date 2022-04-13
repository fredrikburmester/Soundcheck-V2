<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBarComponent.vue'

import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import PopupComponent from './components/PopupComponent.vue'

export default {
    name: 'App',
    components: {
        NavBar,
        RouterView,
        PopupComponent,
    },
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['authenticated', 'key', 'id', 'name', 'notification', 'notificationType', 'notifications', 'socketid']),
    },
    methods: {
        ...mapActions(useUserStore, ['logout', 'getUser']),
    },
    sockets: {
        connected(socketid) {
            this.socketid = socketid
            this.$socket.client.emit('updateUser', this.id)
        },
        error({ status, msg }) {
            console.log(status, msg)
            this.notification = msg
            this.notificationType = 'error'
            if (status != 200) {
                this.$router.push(`/`)
            }
        },
        redirect({ status, msg, route }) {
            if (!route) route = '/'
            console.log(status, msg)
            this.notification = msg
            this.notificationType = 'success'
            if (status != 200) {
                this.$router.push(route)
            }
        },
        logout({ status, msg }) {
            console.log(status, msg)
            this.notification = msg
            this.notificationType = 'success'
            this.logout()
            this.$router.push(`/login`)
        },
        invite(data) {
            this.notifications.push(data)
        },
    },
}
</script>

<template>
    <NavBar />
    <div class="flex flex-col pt-16 items-center h-full">
        <RouterView />
    </div>
    <PopupComponent class="z-100" />
    <div id="chat-target"></div>
</template>

<style>
@import '@/assets/base.css';

#app {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
}

.fixed-center-button {
    left: 50% !important;
    transform: translate(-50%, 0) !important;
    width: calc(100vw - 5em) !important;
    max-width: 700px !important;
    position: fixed !important;
    bottom: 40px !important;
    animation: none !important;
    transition: none !important;
}
</style>
