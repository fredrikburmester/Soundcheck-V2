<template>
    <div class="flex flex-col w-screen justify-start px-8 pb-12 md:px-32 md:mt-16">
        <div class="flex flex-row space-x-8 items-center">
            <div class="avatar pt-2">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img :src="avatar" />
                </div>
            </div>
            <p class="text-2xl">{{ display_name }}</p>
        </div>
        <div class="flex flex-col md:flex-row flex-wrap">
            <div class="h-56 card bg-base-100 shadow-xl image-full mt-12 md:mr-12">
                <figure id="bg1"></figure>
                <div class="card-body">
                    <h2 class="card-title">Soundcheck!?</h2>
                    <p>Can you guess your friends favorite songs?</p>
                    <div class="card-actions justify-end">
                        <router-link to="/play">
                            <button class="btn btn-primary">Play now</button>
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="h-56 card bg-base-100 shadow-xl image-full md:mr-12 mt-12">
                <figure id="bg2"></figure>
                <div class="card-body">
                    <h2 class="card-title">My top songs</h2>
                    <p>Check out your top songs!</p>
                    <div class="card-actions justify-end">
                        <router-link to="/my-top/tracks">
                            <button class="btn btn-primary">enter</button>
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="h-56 card bg-base-100 shadow-xl image-full md:mr-12 mt-12">
                <figure id="bg2"></figure>
                <div class="card-body">
                    <h2 class="card-title">My top artists</h2>
                    <p>See who your top artists are!</p>
                    <div class="card-actions justify-end">
                        <router-link to="/my-top/tracks">
                            <button class="btn btn-primary">enter</button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <hr class="my-12 opacity-20" />
        <div class="stats shadow bg-secondary">
            <div class="stat">
                <div class="stat-title">Active users</div>
                <div class="stat-value">{{ activeUsers }}</div>
                <div class="stat-desc"></div>
            </div>
            <div class="stat">
                <div class="stat-title">Active games</div>
                <div class="stat-value">{{ activeGames }}</div>
                <div class="stat-desc"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'
export default {
    props: {},
    data() {
        return {
            activeUsers: 0,
            activeGames: 0,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['display_name', 'avatar']),
    },
    mounted() {
        // run function every second
        setInterval(() => {
            this.getStats()
        }, 1000)
    },
    sockets: {
        stats({ activeUsers, activeGames }) {
            this.activeUsers = activeUsers || 0
            this.activeGames = activeGames || 0
        },
    },
    methods: {
        getStats() {
            this.$socket.client.emit('getStats')
        },
    },
}
</script>

<style scoped>
#bg1 {
    background: rgb(131, 58, 180);
    background: linear-gradient(43deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);
}
#bg2 {
    background: rgb(34, 193, 195);
    background: linear-gradient(43deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
}
.card {
    height: 190px;
}
.stats {
    max-width: 300px;
}
</style>
