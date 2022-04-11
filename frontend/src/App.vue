<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'

import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import NotificationComponent from './components/NotificationComponent.vue'

export default {
    name: 'App',
    components: {
        NavBar,
        RouterView,
        NotificationComponent,
    },
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['authenticated', 'key', 'id', 'name', 'notification', 'notificationType']),
    },
    methods: {
        ...mapActions(useUserStore, ['logout', 'getUser']),
    },
    sockets: {
        connected() {},
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
    },
}
</script>

<template>
    <NavBar />
    <div class="flex flex-col pt-16 items-center h-full">
        <RouterView />
    </div>
    <NotificationComponent class="z-100" />
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
    left: 50%;
    transform: translate(-50%, 0);
    width: calc(100vw - 5em);
    max-width: 700px;
    position: fixed;
    bottom: 40px;
    animation: none !important;
    transition: none;
}
</style>
