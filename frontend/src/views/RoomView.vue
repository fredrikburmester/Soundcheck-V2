<template>
    <div v-if="!loading" id="room">
        <LobbyComponent v-if="gameState == 'lobby'" :players="players" :room="room" @leave-room="leaveRoom" @start-game="startGame" />
        <GameComponent
            v-if="gameState == 'playing'"
            :settings="room.settings"
            :players="players"
            :room="room"
            @leave-room="leaveRoom"
            @next-question="nextQuestion"
        />
        <ResultsComponent v-if="gameState == 'finished'" :players="players" :room="room" />
    </div>
</template>

<script>
import { mapWritableState, mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'
import LobbyComponent from '../components/LobbyComponent.vue'
import GameComponent from '../components/GameComponent.vue'
import ResultsComponent from '../components/ResultsComponent.vue'

export default {
    components: { LobbyComponent, GameComponent, ResultsComponent },
    data() {
        return {
            loading: true,
            players: [],
            room: null,
            gameState: 'lobby',
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id', 'roomCode']),
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
            this.roomCode = this.room.code

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
                        console.log(response.room)
                        this.room = response.room
                        if (response.room.status == 'lobby') {
                            this.sendTopSongs(this.room.settings.timeRange, this.room.settings.nrOfSongs)
                        }

                        if (response.room.status == 'finished') {
                            console.log('Room is finished')
                            this.gameState = 'finished'
                        }

                        this.loading = false
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
            this.roomCode = ''
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

<style>
#room {
    margin-bottom: 200px;
    min-height: calc(100vh - 100px);
}
</style>
