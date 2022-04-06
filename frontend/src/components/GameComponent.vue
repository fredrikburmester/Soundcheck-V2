/* eslint-disable no-undef */
<template>
    <div v-if="!loading" class="flex w-screen md:max-w-3xl flex-col p-8 h-full">
        <PageTitle :title="$route.params.id" subtitle="Guess the player you think this song belongs to!" />
        <button class="btn btn-error btn-sm mb-4" @click="$emit('leaveRoom')">Leave room</button>
        <h1 v-if="players.length == 1" class="font-bold text-xl italic mb-4">{{ players.length }} Player</h1>
        <h1 v-else class="font-bold text-xl italic mb-4">{{ players.length }} Players</h1>
        <UserCard v-for="p in players" :key="p.id" :host="room_.host.id == p.id" :img="p.img" :display-name="p.name" />
        <div class="mb-auto"></div>
        <SongCard :key="currentQuestion" :title="songs[currentQuestion].name" :artist="songs[currentQuestion].artist" :img="songs[currentQuestion].img" />
        <div v-if="isHost" class="flex flex-row mb-8 mt-8 space-x-8">
            <button :class="playing ? 'flex flex-grow btn btn-error' : 'flex flex-grow btn btn-success'" @click="playSong">
                {{ playing ? 'pause' : 'play' }}
            </button>
            <button class="flex flex-grow btn btn-primary" @click="$emit('nextQuestion')">Next song</button>
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
            loading: true,
            currentQuestion: this.room.currentQuestion,
            songs: this.room.songs,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['token', 'id']),
    },
    watch: {
        room: function (newVal, oldVal) {
            console.log('room changed', newVal.currentQuestion, oldVal.currentQuestion)
            this.currentQuestion = newVal.currentQuestion
        },
    },
    mounted() {
        let recaptchaScript = document.createElement('script')
        recaptchaScript.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
        document.head.appendChild(recaptchaScript)

        window.onSpotifyWebPlaybackSDKReady = () => {
            const token =
                'BQCytq8Hn8WIDUd_4lcFiEn10mBHNJj4EF4XaOLjj_mWs2rV_lGo6HYhgHMhH56xpDoxZx18bHsFEnOaiDD_DREnWc_kExhWcu6qqJXNVFkL9St2DK2yoaGW1LlufU57ky_guM-vImRJSzzlm1BFJ7LLA0iKY-13Z9cqryK096oxUXP-9msa9ztTHFs'
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
                this.loading = false
            })

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id)
            })

            player.addListener('account_error', ({ message }) => {
                console.error(message)
            })

            player.connect()
            console.log(player)
        }
    },
    beforeUnmount() {
        if (this.playing) {
            this.togglePlay()
        }
    },
    methods: {
        isHost() {
            console.log(this.room_.host.id, this.id)
            return this.room_.host.id == this.id
        },
        playSong() {
            if (this.started == false) {
                this.started = true
            } else {
                this.togglePlay()
                this.playing = !this.playing
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
            this.player.togglePlay().then(() => {
                console.log('Toggled playback!')
            })
        },
        // async nextTrack() {
        //     this.player.nextTrack().then(() => {
        //         console.log('Next song...')
        //     })
        // },
    },
}
</script>
