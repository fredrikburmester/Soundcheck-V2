<template>
    <div class="w-screen h-16 bg-base-100 fixed top-0 z-100"></div>
    <div v-if="authenticated" ref="target" :key="$route.path" class="navbar bg-transparent fixed top-0 z-100">
        <div class="navbar-start">
            <div class="dropdown">
                <div class="indicator" @click="toggleNavBar">
                    <label class="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </label>
                </div>
                <transition name="slide-from-left">
                    <ul v-if="navbarOpen" class="menu menu-dropdown mt-3 p-2 bg-base-300 shadow rounded-box w-72">
                        <li><router-link class="font-bold" to="/">Home</router-link></li>
                        <li><router-link class="font-bold" to="/play">Play</router-link></li>
                        <li class="">
                            <a class="justify-between">
                                Previous games
                                <span class="badge badge-secondary">Coming soon</span>
                            </a>
                        </li>
                        <li><router-link class="font-bold" to="/my-top/tracks">My top tracks</router-link></li>
                        <li>
                            <router-link class="font-bold" to="/my-top/artists">My top artists<span class="badge badge-success">New</span></router-link>
                        </li>
                        <hr v-if="roomCode" class="opacity-10 my-4 mx-4" />
                        <p v-if="roomCode" class="font-bold text-md ml-4 mb-2">{{ roomCode }}</p>
                        <router-link :to="`/room/${roomCode}`">
                            <button v-if="roomCode" class="btn btn-primary animate-pulse mx-4 mb-4">Active game</button>
                        </router-link>
                    </ul>
                </transition>
            </div>
        </div>
        <div class="fixed top-2 right-16">
            <div>
                <label class="btn btn-ghost btn-circle avatar overflow-visible" @click="toggleNotificationPanel">
                    <div :class="notifications.length > 0 ? 'indicator animate-bounce' : 'indicator'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        <span v-if="notifications.length > 0" class="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                </label>
                <transition name="slide-from-right">
                    <ul v-if="notificationPanelOpen" class="mt-3 p-4 shadow menu menu-compact fixed top-14 right-2 bg-base-300 rounded-box w-64">
                        <p class="ml-2 mb-2 font-bold">Notifications:</p>
                        <li v-for="n in notifications.slice().reverse()" :key="n.message" class="mb-4">
                            <div class="flex flex-col items-start p-4">
                                <p>
                                    <span class="capitalize font-bold">{{ n.type }}:</span> {{ n.message }}
                                </p>
                                <div class="flex flex-row">
                                    <button class="btn btn-sm btn-primary mr-2" @click="acceptInvitation(n)">Accept</button>
                                    <button class="btn btn-sm btn-error" @click="declineInvitation(n)">Decline</button>
                                </div>
                            </div>
                        </li>
                        <button class="btn btn-sm btn-primary" @click="clearAllNotifications">Clear all</button>
                    </ul>
                </transition>
            </div>
        </div>
        <div class="fixed top-2 right-2">
            <div>
                <label class="btn btn-ghost btn-circle avatar" @click="toggleProfile">
                    <div class="w-10 rounded-full">
                        <img :src="avatar" />
                    </div>
                </label>
                <transition name="slide-from-right">
                    <ul v-if="profileOpen" class="mt-3 p-2 shadow menu menu-compact fixed top-14 right-2 bg-base-300 rounded-box w-64">
                        <li class="mb-2">
                            <p>
                                Logged in as:
                                <br />
                                {{ display_name }}
                                <br />
                                {{ id }}
                            </p>
                        </li>
                        <li><a class="bg-red-600 text-black font-bold" @click="logout">Logout</a></li>
                    </ul>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

export default {
    setup() {
        const target = ref(null)
        let navbarOpen = ref(false)
        let profileOpen = ref(false)
        let notificationPanelOpen = ref(false)

        onClickOutside(target, () => {
            navbarOpen.value = false
            profileOpen.value = false
            notificationPanelOpen.value = false
        })

        const toggleNavBar = () => {
            navbarOpen.value = !navbarOpen.value
            profileOpen.value = false
        }

        const toggleNotificationPanel = () => {
            notificationPanelOpen.value = !notificationPanelOpen.value
            navbarOpen.value = false
            profileOpen.value = false
        }

        const toggleProfile = () => {
            profileOpen.value = !profileOpen.value
            navbarOpen.value = false
        }

        return { target, navbarOpen, profileOpen, notificationPanelOpen, toggleNavBar, toggleProfile, toggleNotificationPanel }
    },
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'avatar', 'authenticated', 'display_name', 'email', 'id', 'roomCode', 'notifications']),
    },
    watch: {
        $route: {
            handler: function () {
                this.navbarOpen = false
                this.profileOpen = false
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {},
    methods: {
        // toggleNavbar() {
        //     this.navbarOpen = !this.navbarOpen
        // },
        acceptInvitation(n) {
            this.$router.push(`/room/${n.roomCode}`)
            this.notifications.pop(n)
            this.notificationPanelOpen = false
        },
        declineInvitation(n) {
            this.notifications.pop(n)
            this.notificationPanelOpen = false
        },
        clearAllNotifications() {
            this.notifications = []
        },
        logout() {
            this.refresh_token = ''
            this.token = ''
            this.authenticated = false
            this.avatar = ''
            this.name = ''
            this.email = ''
            this.$router.push('/login')
        },
    },
}
</script>

<style scoped>
.slide-from-left-enter-active,
.slide-from-left-leave-active {
    transition: all 0.2s ease;
}

.slide-from-left-enter-from,
.slide-from-left-leave-to {
    transform: translateX(-200px);
    opacity: 0;
}
.slide-from-right-enter-active,
.slide-from-right-leave-active {
    transition: all 0.2s ease;
}

.slide-from-right-enter-from,
.slide-from-right-leave-to {
    transform: translateX(200px);
    opacity: 0;
}
.menu {
    width: calc(100vw - 20px);
    max-width: 400px;
}
.indicator {
    overflow: visible !important;
}
</style>
