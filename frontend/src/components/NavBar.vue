<template>
    <div class="w-screen h-16 backdrop-blur-sm fixed top-0 z-100"></div>
    <div v-if="authenticated" class="navbar bg-transparent fixed top-0 z-100">
        <div :key="$route.path" class="navbar-start">
            <div class="dropdown">
                <label tabindex="0" class="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </label>
                <ul tabindex="0" class="menu dropdown-content mt-3 p-2 bg-base-300 shadow rounded-box w-52">
                    <li><router-link class="font-bold" to="/">Home</router-link></li>
                    <li><router-link class="font-bold" to="/play">Play</router-link></li>
                    <li><router-link class="font-bold" to="/my-previous-games">Previous Games</router-link></li>
                    <li><router-link class="font-bold" to="/my-top-songs">My top songs</router-link></li>
                    <li><router-link class="font-bold" to="/my-top-artists">My top artists</router-link></li>
                    <hr v-if="roomCode" class="opacity-10 my-4 mx-4" />
                    <p v-if="roomCode" class="font-bold text-md ml-4 mb-2">{{ roomCode }}</p>
                    <router-link :to="`/room/${roomCode}`">
                        <button v-if="roomCode" class="btn btn-primary animate-pulse mx-4 mb-4">Active game</button>
                    </router-link>
                </ul>
            </div>
        </div>
        <div class="navbar-end">
            <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                    <div class="w-10 rounded-full">
                        <img :src="avatar" />
                    </div>
                </label>

                <ul tabindex="0" class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-300 rounded-box w-52">
                    <li>
                        <p>
                            Logged in as:
                            <br />
                            {{ display_name }}
                            <br />
                            {{ id }}
                        </p>
                    </li>
                    <!-- <li>
                        <a class="justify-between">
                            Profile
                            <span class="badge">New</span>
                        </a>
                    </li>
                    <li><a>Settings</a></li> -->

                    <li><a class="bg-red-600 text-black font-bold" @click="logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'

export default {
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'avatar', 'authenticated', 'display_name', 'email', 'id', 'roomCode']),
    },
    methods: {
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
