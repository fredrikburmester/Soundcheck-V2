<template>
    <div class="flex w-screen md:max-w-3xl flex-col px-8 h-full">
        <PageTitle>
            <template #main>
                <p class="text-xs mb-2">
                    Room code:
                    <span class="text-primary text-xs">{{ $route.params.id }}</span>
                </p>
                <p class="text-md">
                    Click the player you think this song belongs to.
                    <span class="font-bold text-primary"> Who's favorite song is it? </span>
                </p>
            </template>
        </PageTitle>
        <div id="player-view">
            <UserCard
                v-for="p in players"
                :key="p"
                :user="p"
                :class="makePlayerGuessId == p.id ? 'animate-pulse ring ring-primary' : ''"
                :guessed="playersGuessed.includes(p.id)"
                @click="makePlayerGuess(p.id)"
            />
        </div>
        <div class="fixed-center-button">
            <div class="flex flex-col w-full justify-center">
                <MusicPlayerComponent
                    :player-position="playerPosition"
                    :song="songs[currentQuestion]"
                    :connected="connected"
                    :allow-seeking="settings.allowSongSeeking"
                    :duration="duration"
                    :loading="connectionLoading"
                    @play="playSong"
                    @pause="pauseSong"
                    @seek="seek"
                />
            </div>
            <div class="flex flex-row mt-2 space-x-8 justify-evenly">
                <button v-if="isHost() && currentQuestion > 0" class="flex btn btn-primary flex-grow w-32" @click="previousQuestion">Previous</button>
                <button v-if="isHost()" class="flex btn btn-primary flex-grow w-32" @click="nextQuestion">Next</button>
            </div>
        </div>
    </div>
    <input id="my-modal-6" type="checkbox" class="modal-toggle" :checked="modalOpen" />
    <div class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
            <h3 class="text-lg">
                Play the music on <span class="font-bold text-primary"> this device</span> or the <span class="font-bold text-secondary">host device</span>?
            </h3>
            <div class="modal-action">
                <label for="my-modal-6" class="btn btn-primary" @click="connectToSpotifyPlayer">My device</label>
                <label for="my-modal-6" class="btn btn-secondary">Host device</label>
            </div>
        </div>
    </div>
</template>
<script>
import UserCard from './UserCard.vue'
import PageTitle from './PageTitle.vue'
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
import SongCard from './SongCardComponent.vue'
import MusicPlayerComponent from './MusicPlayerComponent.vue'

export default {
    components: { UserCard, PageTitle, SongCard, MusicPlayerComponent },
    props: {
        players: {
            type: Array,
            required: true,
        },
        room: {
            type: Object,
            required: true,
        },
        settings: {
            type: Object,
            required: true,
        },
    },
    emits: ['nextQuestion', 'leaveRoom', 'previousQuestion'],
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
            playersGuessed: this.room.usersGuessedOnCurrentQuestion,
            modalOpen: true,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['token', 'id', 'notification']),
    },
    watch: {
        room: function (newVal, oldVal) {
            this.room_ = JSON.parse(JSON.stringify(this.room))

            if (newVal.currentQuestion != oldVal.currentQuestion) {
                this.playing = false
                this.playerInitiated = false
                this.playerPosition = 0
                this.duration = 0
                this.currentQuestion = newVal.currentQuestion
                this.makePlayerGuessId = null
                this.playersGuessed = []

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
    sockets: {
        playerGuessed: function (userId) {
            if (!this.playersGuessed.includes(userId)) {
                this.playersGuessed.push(userId)
            }
        },
    },
    methods: {
        hasGuessed(userId) {
            return this.playersGuessed.includes(userId)
        },
        leaveRoom() {
            this.stopProgress()
            this.$emit('leaveRoom')
        },
        makePlayerGuess(id) {
            this.$socket.client.emit('makePlayerGuess', {
                roomId: this.$route.params.id,
                userId: this.id,
                songId: this.room_.songs[this.currentQuestion].id,
                guess: id,
            })
            this.makePlayerGuessId = id
        },
        seek(position) {
            this.playerPosition = parseInt(position)
            this.player.seek(this.playerPosition)
            this.startProgress()
        },
        async setProgress() {
            let state = await this.getPlayerState()
            this.duration = state.duration
            this.playerPosition = state.position
            this.playing = !state.paused
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

            if (state == null || state == undefined) {
                return false
            } else {
                return state
            }
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
                    this.connected = false
                    this.connectionLoading = false
                })

                player.connect()
            }
        },
        nextQuestion() {
            this.makePlayerGuessId = null
            this.playersGuessed = []
            this.$emit('nextQuestion')
        },
        previousQuestion() {
            this.makePlayerGuessId = null
            this.playersGuessed = []
            this.$emit('previousQuestion')
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
                    .then(() => {
                        this.playerInitiated = true
                    })
                    .catch((err) => {
                        console.log(err)
                        this.notification = "Music isn't available right now"
                        return
                    })
            }

            await this.waitUntilPlayerLoaded()
            this.player.resume()
            this.startProgress()

            let state = await this.getPlayerState()

            if (state.loading || state.paused) {
                this.notification = "Music isn't available right now"
                return
            }
            this.playing = true
        },
        async waitUntilPlayerLoaded() {
            return new Promise((resolve) => {
                ;(async () => {
                    const interval = setInterval(async () => {
                        let state = await this.getPlayerState()
                        if (!state.loading) {
                            clearInterval(interval)
                            resolve()
                        }
                    }, 100)
                })()
            })
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
