<template>
    <div v-if="!loading" class="h-full">
        <LobbyComponent v-if="gameState == 'lobby'" :players="players" :room="room" @leave-room="leaveRoom" @start-game="startGame" />
        <GameComponent v-if="gameState == 'playing'" :players="players" :room="room" @leave-room="leaveRoom" @next-question="nextQuestion" />
        <div v-if="gameState == 'finished'">Done</div>
    </div>
</template>

<script>
import { mapWritableState, mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'
import LobbyComponent from '../components/LobbyComponent.vue'
import GameComponent from '../components/GameComponent.vue'

export default {
    components: { LobbyComponent, GameComponent },
    data() {
        return {
            loading: true,
            players: [],
            room: null,
            gameState: 'lobby',
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
            this.gameState = this.room.status

            this.loading = false
        },
        startGame(settings) {
            console.log(settings)
            this.gameState = 'playing'
        },
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs']),
        async joinRoom() {
            this.$socket.client.emit(
                'joinRoom',
                {
                    userId: this.id,
                    roomCode: this.$route.params.id,
                },
                (response) => {
                    if (response.status == 200) {
                        this.room = response.room
                        this.sendTopSongs(this.room.settings.timeRange, this.room.settings.nrOfSongs)
                    }
                }
            )
        },
        async sendTopSongs(time_range, limit) {
            console.log('sending top songs')
            const songs = await this.getTopSongs(time_range, limit)
            this.$socket.client.emit('topSongs', {
                userId: this.id,
                songs: songs,
            })
        },
        leaveRoom() {
            this.$socket.client.emit('leaveRoom', {
                roomCode: this.$route.params.id,
                userId: this.id,
            })
            this.$router.push('/')
        },
        startGame() {
            console.log('Start the game')
            this.$socket.client.emit('startGame', {
                roomCode: this.$route.params.id,
            })
        },
        nextQuestion() {
            console.log('Next question')
            this.$socket.client.emit('nextQuestion', {
                roomCode: this.$route.params.id,
            })
        },
    },
}
</script>
