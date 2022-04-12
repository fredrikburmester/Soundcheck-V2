<template>
    <div id="results" class="px-8">
        <PageTitle :title="$route.params.id" subtitle="Check out the results by pressing a user below!" />
        <label for="my-modal-6" class="btn btn-sm btn-success modal-button mb-4">Create playlist</label>
        <input id="my-modal-6" type="checkbox" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle">
            <div class="modal-box bg-zinc-900">
                <h3 class="font-bold text-lg">Create a Spotify playlist with the songs from the game</h3>
                <hr class="my-4 opacity-10" />
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text opacity-60">Playlist name</span>
                    </label>
                    <input v-model="playlistName" type="text" class="input input-bordered w-full max-w-xs bg-black" />
                </div>
                <div class="modal-action mb-12">
                    <label for="my-modal-6" class="btn btn-primary">Close</label>
                    <label for="my-modal-6" class="btn btn-success" @click="compileAndCreatePlaylist">Create</label>
                </div>
            </div>
        </div>
        <div v-for="p in sortedUsers" :key="p.id" tabindex="0" class="collapse" :style="cssVars">
            <UserCard :img="p.img" :display-name="p.name" class="collapse-title" />
            <input id="checkbox" type="checkbox" class="peer" />
            <div class="rounded-b-2xl m-0 px-4 collapse-content bg-secondary text-primary-content">
                <h1 class="text-white mt-4 text-2xl font-bold">Points: {{ p.points * 10 }}</h1>
                <p class="text-white opacity-70">Per song answers for {{ p.name }}</p>
                <div v-for="(song, index) in room.songs" :key="song.id" class="mt-6">
                    <SongCard :index="index" :title="song.name" :img="song.img" :artist="song.artist" />
                    <p class="text-white mt-2 ml-2 opacity-70">Your guess: {{ getGuessName(p.guesses, song.id) }}</p>
                    <p class="text-white ml-2 opacity-70">Correct answer: {{ getCorrectAnswerName(song.id) }}</p>
                </div>
            </div>
        </div>
        <div v-if="sortedUsers.length == 0">
            <hr class="my-4 opacity-20" />
            <p class="my-4 text-left text-xl italic text-white">Hmm i guess no one even played this one? Maybe everyone left before it even started.</p>
        </div>
    </div>
</template>

<script>
import UserCard from './UserCard.vue'
import PageTitle from './PageTitle.vue'
import SongCard from './SongCardComponent.vue'

import { useUserStore } from '@/stores/user'
import { mapActions } from 'pinia'
export default {
    components: { UserCard, PageTitle, SongCard },
    props: {
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
            playlistName: 'Soundcheck: ' + this.$route.params.id,
        }
    },
    computed: {
        sortedUsers() {
            let users = this.room_.users.slice()
            return users.sort((a, b) => b.points - a.points)
        },
        cssVars() {
            return {
                '--max-card-height': 150 + this.room.songs.length * 180 + 'px',
            }
        },
    },
    mounted() {},
    methods: {
        ...mapActions(useUserStore, ['createPlaylist']),
        compileAndCreatePlaylist() {
            this.createPlaylist(this.room.songs, this.playlistName)
        },
        getCorrectAnswerName(songId) {
            let users = null
            // ger users from songs.users
            for (let i = 0; i < this.room.songs.length; i++) {
                if (this.room.songs[i].id == songId) {
                    users = this.room.songs[i].users
                }
            }

            // get users names from songs.users
            let names = []
            for (let i = 0; i < users.length; i++) {
                for (let u of this.room.users) {
                    if (u.id == users[i]) {
                        names.push(u.name)
                    }
                }
            }

            return names.join(', ')
        },
        getGuessName(guesses, songId) {
            // find name of user where songId is in guesses
            for (let i = 0; i < guesses.length; i++) {
                if (guesses[i].songId == songId) {
                    let userId = guesses[i].userId
                    let user = this.room.users.filter((u) => u.id == userId)
                    return user[0].name
                }
            }
            return 'No guess'
        },
    },
}
</script>
<style scoped>
* {
    outline: none !important;
}
input:focus,
select:focus,
textarea:focus,
button:focus {
    outline: none !important;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
    -webkit-appearance: none !important;
}

input {
    box-shadow: none !important;
    outline: none !important;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
    -webkit-appearance: none !important;
}
.collapse-content {
    transform: translateY(-20px);
    z-index: 1;
}
#results {
    padding-bottom: 50px;
}
.collapse,
.collapse-content {
    transition: all 0.5s ease !important;
}

.collapse-open .collapse-content,
.collapse:focus:not(.collapse-close) .collapse-content,
.collapse:not(.collapse-close) input[type='checkbox']:checked ~ .collapse-content {
    max-height: var(--max-card-height) !important;
}
</style>
