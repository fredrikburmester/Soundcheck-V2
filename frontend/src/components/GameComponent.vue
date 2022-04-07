/* eslint-disable no-undef */
<template>
    <div class="flex w-screen md:max-w-3xl flex-col p-8 h-full">
        <PageTitle :title="$route.params.id" subtitle="Guess the player you think this song belongs to!" />
        <button class="btn btn-error btn-sm mb-4" @click="$emit('leaveRoom')">Leave room</button>
        <h1 v-if="players.length == 1" class="font-bold text-xl italic mb-4">{{ players.length }} Player</h1>
        <h1 v-else class="font-bold text-xl italic mb-4">{{ players.length }} Players</h1>
        <UserCard v-for="p in players" :key="p.id" :host="room_.host.id == p.id" :img="p.img" :display-name="p.name" />
        <div class="mb-auto"></div>
        <div class="flex flex-col w-full justify-center">
            <SongCard :key="currentQuestion" :title="songs[currentQuestion].name" :artist="songs[currentQuestion].artist" :img="songs[currentQuestion].img" />
            <progress :value="playerPosition" class="progress progress-primary bg-gray-700 w-full mt-8" :max="duration"></progress>
        </div>
        <div v-if="connected">
            <div v-if="isHost" class="flex flex-row mb-8 mt-8 space-x-8">
                <button :class="playing ? 'flex flex-grow btn btn-error' : 'flex flex-grow btn btn-success'" @click="playSong">
                    {{ playing ? 'pause' : 'play' }}
                </button>
                <button class="flex flex-grow btn btn-primary" @click="$emit('nextQuestion')">Next song</button>
            </div>
            <div v-else>
                <button :class="playing ? 'flex flex-grow btn btn-error' : 'flex flex-grow btn btn-success'" @click="playSong">
                    {{ playing ? 'pause' : 'play' }}
                </button>
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
            started: false,
            host: this.room.host.id == this.id,
            currentQuestion: this.room.currentQuestion,
            songs: this.room.songs,
            connected: false,
            connectionLoading: false,
            timer: null,
            playerPosition: 0,
            duration: 0,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['token', 'id']),
    },
    watch: {
        room: function (newVal, oldVal) {
            this.room_ = JSON.parse(JSON.stringify(this.room))

            if (newVal.currentQuestion != oldVal.currentQuestion) {
                this.playing = false
                this.started = false
                this.playerPosition = 0
                this.duration = 0
                this.currentQuestion = newVal.currentQuestion
                this.togglePlay()
                clearInterval(this.timer)
            }
        },
    },
    mounted() {},
    beforeUnmount() {
        if (this.playing) {
            this.togglePlay()
        }
        this.player.disconnect()
        clearInterval(this.timer)
    },
    methods: {
        async getPlayerState() {
            let state = await this.player.getCurrentState()
            this.duration = state.duration
            this.playerPosition = state.position
        },
        isHost() {
            return this.room_.host.id == this.id
        },
        connectToSpotifyPlayer() {
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

                player.connect()
            }
        },
        playSong() {
            if (this.started == false) {
                this.started = true
                this.timer = setInterval(() => {
                    this.getPlayerState()
                }, 1000)
            } else {
                this.togglePlay()
                this.playing = !this.playing

                if (this.playing) {
                    this.timer = setInterval(() => {
                        this.getPlayerState()
                    }, 1000)
                } else {
                    clearInterval(this.timer)
                }
                return
            }
            var self = this
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${self.device_id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    uris: [`spotify:track:${this.songs[this.currentQuestion].id}`],
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${self.token}`,
                },
            })
            this.playing = true
        },
        async togglePlay() {
            this.player.togglePlay().then(() => {})

            let s_state = await this.player.getCurrentState()
        },
    },
}
</script>
