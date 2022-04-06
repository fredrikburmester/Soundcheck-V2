<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'

import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'

export default {
    name: 'App',
    components: {
        NavBar,
        RouterView,
    },
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['authenticated', 'key', 'id', 'name']),
    },
    methods: {
        ...mapActions(useUserStore, ['logout']),
    },
    sockets: {
        connected() {},
        error({ status, msg }) {
            console.log(status, msg)
            if (status != 200) {
                this.$router.push(`/`)
            }
        },
        redirect({ status, msg, route }) {
            if (!route) route = '/'
            console.log(status, msg)
            if (status != 200) {
                this.$router.push(route)
            }
        },
        logout({ status, msg }) {
            console.log(status, msg)
            this.logout()
            this.$router.push(`/login`)
        },
    },
}
</script>

<template>
    <NavBar />
    <div class="pt-12 h-full">
        <RouterView />
    </div>
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
</style>
