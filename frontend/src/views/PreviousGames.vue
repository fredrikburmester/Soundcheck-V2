<template>
    <div class="flex flex-col px-8 pb-24 w-screen items-center">
        <div class="pb-4 max-w-2xl w-full">
            <h1 class="text-3xl text-start">Your previous games</h1>
            <p class="text-start">Just click on a game to see more!</p>
            <br />
        </div>
        <div v-if="!loading" class="flex flex-col place-items-center w-full max-w-2xl">
            <TransitionGroup name="list">
                <PreviousGameCard v-for="game in games.slice().reverse()" :key="game" :room="game" class="mb-4"></PreviousGameCard>
            </TransitionGroup>
        </div>
        <LoadingComponent v-if="loading" />
    </div>
</template>
<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import LoadingComponent from '../components/LoadingComponent.vue'
import PreviousGameCard from '../components/PreviousGameCard.vue'

export default {
    components: { LoadingComponent, PreviousGameCard },
    data() {
        return {
            games: [],
            loading: true,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'top_items', 'id']),
    },
    watch: {},
    async mounted() {
        this.loading = true
        await this.getPreviousGames()
        this.loading = false
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs', 'createPlaylist']),
        async getPreviousGames() {
            this.$socket.client.emit('getPlayerGames', {
                userId: this.id,
            })
        },
    },
    sockets: {
        playerGames(games) {
            console.log(games)
            this.games = games
            this.loading = false
        },
    },
}
</script>
<style scoped>
.tabs {
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 278px;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
    position: absolute;
}
</style>
