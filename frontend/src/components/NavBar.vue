<template>
    <div class="w-screen h-16 backdrop-blur-sm fixed top-0 z-100"></div>
    <div v-if="authenticated" class="navbar bg-transparent fixed top-0 z-100">
        <div :key="$route.path" class="navbar-start">
            <div ref="target" class="dropdown">
                <div class="indicator" @click="toggleNavBar">
                    <label class="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </label>
                </div>
                <transition name="fade">
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
        <div class="fixed top-2 right-2">
            <div class="dropdown dropdown-end">
                <label class="btn btn-ghost btn-circle avatar" @click="toggleProfile">
                    <div class="w-10 rounded-full">
                        <img :src="avatar" />
                    </div>
                </label>
                <transition name="fade">
                    <ul v-if="profileOpen" class="mt-3 p-2 shadow menu menu-compact fixed top-14 right-2 bg-base-300 rounded-box w-52">
                        <li>
                            <p>
                                Logged in as:
                                <br />
                                {{ display_name }}
                                <br />
                                {{ id }}
                            </p>
                        </li>
                        <li>
                            <p>
                                {{ $socket.connected ? 'Connected' : 'Disconnected' }}
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

        onClickOutside(target, () => {
            navbarOpen.value = false
            profileOpen.value = false
        })

        const toggleNavBar = () => {
            navbarOpen.value = !navbarOpen.value
            profileOpen.value = false
        }

        const toggleProfile = () => {
            profileOpen.value = !profileOpen.value
            navbarOpen.value = false
        }

        return { target, navbarOpen, toggleNavBar, toggleProfile, profileOpen }
    },
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'avatar', 'authenticated', 'display_name', 'email', 'id', 'roomCode']),
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
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
