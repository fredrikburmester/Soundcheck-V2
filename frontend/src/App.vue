<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBarComponent.vue'

import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import PopupComponent from './components/PopupComponent.vue'

import { useWebNotification } from '@vueuse/core'

// import { useVibrate } from '@vueuse/core'
// import { watch } from 'vue'
// import { useRoute } from 'vue-router'

export default {
    name: 'App',
    components: {
        NavBar,
        RouterView,
        PopupComponent,
    },
    setup() {},
    data() {
        return {
            route: this.$route,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, [
            'authenticated',
            'key',
            'id',
            'name',
            'notification',
            'notificationType',
            'notifications',
            'socketid',
            'display_name',
            'avatar',
        ]),
    },
    methods: {
        ...mapActions(useUserStore, ['logout', 'getUser']),
    },
    sockets: {
        connected(socketid) {
            this.socketid = socketid
            this.$socket.client.emit('updateUser', {
                id: this.id,
                name: this.display_name,
                img: this.avatar,
            })
        },
        warning({ status, msg }) {
            console.log(status, msg)
            this.notification = msg
            this.notificationType = 'error'
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
            console.log(status, msg, route)
            if (!route || route === undefined || route === null || route.length == 0) {
                console.log('Invalid redirect. No route provided')
                return
            } else {
                console.log('[redirect]', status, msg)
                if (msg && msg.length > 0) {
                    this.notification = msg
                    this.notificationType = 'success'
                }
                // this.$router.push({ name: 'Play' })
                location.href = route
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

            console.log('notification', data)

            const options = {
                title: 'New invite',
                body: data.message,
                dir: 'auto',
                lang: 'en',
                tag: 'invite',
                renotify: true,
            }

            const { isSupported, show } = useWebNotification(options)

            if (isSupported) {
                show()
            }
        },
    },
}
</script>

<template>
    <NavBar />
    <div class="flex flex-col pt-16 items-center h-full">
        <RouterView v-slot="{ Component }">
            <template v-if="Component">
                <Transition name="fade" mode="out-in">
                    <component :is="Component"></component>
                </Transition>
            </template>
        </RouterView>
    </div>
    <div id="chat-target"></div>
    <div id="modal-target"></div>
    <PopupComponent class="z-100" />
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
    width: calc(100vw - 3em) !important;
    max-width: 700px !important;
    position: fixed !important;
    bottom: 40px !important;
    animation: none !important;
    transition: none !important;
}
.fade-enter-active,
.fade-leave-active {
    transition: all 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
