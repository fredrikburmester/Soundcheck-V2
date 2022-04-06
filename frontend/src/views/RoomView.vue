<template>
    <div v-if="!loading" class="p-8 flex flex-col justify-around h-full">
        <PageTitle :title="$route.params.id" subtitle="Welcome to the game room!" />
        <UserCard v-for="player in players" :key="player.id" :img="player.img" :display-name="player.name" />

        <button class="btn btn-error mt-auto" @click="leaveRoom">Leave room</button>
    </div>
</template>
<script>
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
import UserCard from '../components/UserCard.vue'
import PageTitle from '../components/PageTitle.vue'
export default {
    components: { UserCard, PageTitle },
    data() {
        return {
            loading: true,
            players: [],
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    mounted() {
        this.joinRoom()
    },
    sockets: {
        roomStatus(room) {
            console.log('Room data: ', room)
            this.players = room.users
            this.loading = false
        },
    },
    methods: {
        joinRoom() {
            console.log('Trying to join the room...', this.id, this.$route.params.id)
            this.$socket.client.emit(
                'joinRoom',
                {
                    userId: this.id,
                    roomCode: this.$route.params.id,
                },
                (response) => {
                    console.log(`[${this.$route.params.id}] response`)
                    if (response.status != 201) {
                        this.$router.push(`/`)
                    }
                }
            )
        },
        leaveRoom() {
            this.$socket.client.emit('leaveRoom', {
                roomCode: this.$route.params.id,
                userId: this.id,
            })
            this.$router.push('/')
        },
    },
}
</script>
