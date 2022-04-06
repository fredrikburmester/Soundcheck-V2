<template>
    <div v-if="!loading" class="h-full">
        <LobbyComponent :players="players" :room="room" @leave-room="leaveRoom" />
    </div>
</template>
<script>
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
// import UserCard from '../components/UserCard.vue'
// import PageTitle from '../components/PageTitle.vue'
import LobbyComponent from '../components/LobbyComponent.vue'
export default {
    components: { LobbyComponent },
    data() {
        return {
            loading: true,
            players: [],
            room: null,
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
            this.room = room
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
