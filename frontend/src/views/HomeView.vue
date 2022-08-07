<template>
    <div class="flex flex-col w-screen justify-start px-8 pb-12 md:px-32 md:mt-16">
        <div class="flex flex-row space-x-8 items-center mb-12">
            <div class="avatar pt-2">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img :src="avatar" />
                </div>
            </div>
            <p class="text-2xl">{{ display_name }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-cols-max gap-4 md:flex-row flex-wrap">
            <FancyCardComponent link="/play">
                <template #header>Soundcheck!</template>
                <template #body>Can you guess your friends favorite songs?</template>
                <template #action>Play</template>
            </FancyCardComponent>
            <hr class="md:hidden opacity-10 my-4" />
            <FancyCardComponent link="/my-top/tracks">
                <template #header>My top songs</template>
                <template #body>Check out your top songs!</template>
                <template #action>Check it out</template>
            </FancyCardComponent>
            <FancyCardComponent link="/my-top/artists">
                <template #header>My top artists</template>
                <template #body>Check out your top songs!</template>
                <template #action>Check it out</template>
            </FancyCardComponent>
        </div>
        <hr class="my-8 opacity-10" />
        <div class="stats shadow-lg bg-base-300">
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
import FancyCardComponent from '../components/FancyCardComponent.vue'
export default {
    components: { FancyCardComponent },
    props: {},
    data() {
        return {
            activeGames: 0,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['display_name', 'avatar', 'id', 'activeUsers']),
    },
    mounted() {
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
.fancy-card {
    max-height: fit-content;
}
</style>
