<template>
    <div class="flex w-screen md:max-w-3xl flex-col px-8 h-full">
        <PageTitle :title="$route.params.id" subtitle="Guess the player you think this song belongs to!" />
        <button class="btn btn-error btn-sm mb-4" @click="leaveRoom">Leave room</button>
        <h1 v-if="players.length == 1" class="font-bold text-xl italic mb-4">{{ players.length }} Player</h1>
        <h1 v-else class="font-bold text-xl italic mb-4">{{ players.length }} Players</h1>
        <UserCard
            v-for="p in players"
            :key="p.id"
            :host="room_.host.id == p.id"
            :img="p.img"
            :display-name="p.name"
            :class="makePlayerGuessId == p.id ? 'animate-pulse border-orange-500 border-2' : ''"
            @click="makePlayerGuess(p.id)"
        />
        <div class="mb-auto"></div>
        <div class="flex flex-col w-full justify-center">
            <hr class="my-4 opacity-20" />
            <SongCard :key="currentQuestion" :title="songs[currentQuestion].name" :artist="songs[currentQuestion].artist" :img="songs[currentQuestion].img" />
            <input
                v-if="!spotifyConnectionError"
                v-model="playerPosition"
                type="range"
                min="0"
                :max="duration"
                class="range range-xs mt-4"
                @change="seek"
                @mousedown="stopProgress"
            />
        </div>
        <div v-if="connected || spotifyConnectionError">
            <div v-if="isHost()" class="flex flex-row mt-8 space-x-8">
                <div v-if="!spotifyConnectionError" class="flex flex-grow">
                    <button v-if="!playing" class="flex flex-grow btn btn-success" @click="playSong">Play</button>
                    <button v-else class="flex flex-grow btn btn-error" @click="pauseSong">plause</button>
                </div>
                <button class="flex flex-grow btn btn-primary" @click="nextQuestion">Next song</button>
            </div>
            <div v-else>
                <div v-if="!spotifyConnectionError" class="flex flex-grow">
                    <button v-if="!playing" class="flex flex-grow btn btn-success" @click="playSong">Play</button>
                    <button v-else class="flex flex-grow btn btn-error" @click="pauseSong">plause</button>
                </div>
            </div>
        </div>
        <div v-else class="flex flex-col mt-8">
            <button v-if="!connectionLoading" class="btn btn-success animate-pulse" @click="connectToSpotifyPlayer">Connect</button>
            <button v-else class="btn btn-success loading"></button>
        </div>
    </div>
</template>
<script>
import UserCard from './UserCard.vue'
import PageTitle from './PageTitle.vue'
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
import SongCard from './SongCard.vue'
export default {
    components: { UserCard, PageTitle, SongCard },
    props: {
        players: {
            type: Array,
            required: true,
        },
        room: {
            type: Object,
            required: true,
        },
    },
    emits: ['nextQuestion', 'leaveRoom'],
    data() {
        return {
            room_: this.room,
            device_id: '',
            player: null,
            playing: false,
            playerInitiated: false,
            host: this.room.host.id == this.id,
            currentQuestion: this.room.currentQuestion,
            songs: this.room.songs,
            connected: false,
            connectionLoading: false,
            timer: null,
            playerPosition: 0,
            duration: 0,
            makePlayerGuessId: null,
            spotifyConnectionError: false,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['token', 'id', 'notification']),
    },
    watch: {
        room: function (newVal, oldVal) {
            console.log('room changed', newVal.currentQuestion, oldVal.currentQuestion)
            this.room_ = JSON.parse(JSON.stringify(this.room))

            if (newVal.currentQuestion != oldVal.currentQuestion) {
                this.playing = false
                this.playerInitiated = false
                this.playerPosition = 0
                this.duration = 0
                this.currentQuestion = newVal.currentQuestion
                this.makePlayerGuessId = null

                if (this.player) {
                    this.player.pause()
                    clearInterval(this.timer)
                }
            }
        },
    },
    mounted() {},
    beforeUnmount() {
        if (this.player && this.playing) {
            this.player.pause()
        }

        if (this.player) {
            this.player.disconnect()
        }

        clearInterval(this.timer)
    },
    methods: {
        leaveRoom() {
            this.stopProgress()
            this.$emit('leaveRoom')
        },
        makePlayerGuess(id) {
            console.log('guess', id)
            this.$socket.client.emit('makePlayerGuess', {
                roomId: this.$route.params.id,
                userId: this.id,
                songId: this.room_.songs[this.currentQuestion].id,
                guess: id,
            })
            this.makePlayerGuessId = id
        },
        seek() {
            this.player.seek(this.playerPosition)
            this.startProgress()
        },
        async setProgress() {
            let state = await this.getPlayerState()
            this.duration = state.duration
            this.playerPosition = state.position
        },
        stopProgress() {
            clearInterval(this.timer)
        },
        startProgress() {
            this.timer = setInterval(() => {
                this.setProgress()
            }, 1000)
        },
        async getPlayerState() {
            let state = await this.player.getCurrentState()
            return state
        },
        isHost() {
            console.log('is host 2', this.room_.host.id, this.id)
            return this.room_.host.id == this.id
        },
        connectToSpotifyPlayer() {
            console.log('connecting to spotify player')
            this.connectionLoading = true
            let recaptchaScript = document.createElement('script')
            recaptchaScript.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
            document.head.appendChild(recaptchaScript)

            window.onSpotifyWebPlaybackSDKReady = () => {
                const token = this.token
                // eslint-disable-next-line no-undef
                const player = new Spotify.Player({
                    name: 'Web Playback SDK Quick Start Player',
                    getOAuthToken: (cb) => {
                        cb(token)
                    },
                    volume: 0.5,
                })

                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id)
                    this.player = player
                    this.device_id = device_id
                    this.connected = true
                    this.connectionLoading = false
                })

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID is not ready for playback', device_id)
                })
                player.on('initialization_error', ({ message }) => {
                    console.error('Failed to initialize', message)
                })

                player.on('authentication_error', ({ message }) => {
                    console.error('Failed to authenticate', message)
                })
                player.on('account_error', ({ message }) => {
                    console.error('Failed to validate Spotify account', message)
                    this.notification = 'You need a premium account to play music'
                    this.spotifyConnectionError = true
                })

                player.connect()
            }
        },
        nextQuestion() {
            this.makePlayerGuessId = null
            this.$emit('nextQuestion')
        },
        async playSong() {
            if (this.playerInitiated == false) {
                var self = this
                await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${self.device_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        uris: [`spotify:track:${this.songs[this.currentQuestion].id}`],
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${self.token}`,
                    },
                })
                    .then((res) => {
                        this.playerInitiated = true
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } else {
                this.player.resume()
                let state = await this.getPlayerState()
                console.log(state)
                if (!state.playing) {
                    this.player.resume()
                }
            }

            let state = await this.getPlayerState()
            if (!state.playing) {
                this.player.resume()
            }

            this.startProgress()

            this.playing = true
        },
        async pauseSong() {
            this.player.pause()
            this.playing = false
            clearInterval(this.timer)
        },
        async togglePlay() {
            this.player.togglePlay()
        },
    },
}
</script>
