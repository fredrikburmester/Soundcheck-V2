<template>
    <div id="results" class="px-4 w-full">
        <PageTitle>
            <template #header>
                <p class="text-xs opacity-50">Room code:</p>
                <p class="gradiant-text font-bold">
                    {{ $route.params.id }}
                </p>
            </template>
            <template #main> You finished! Check out your score below!</template>
        </PageTitle>
        <label for="my-modal-6" class="btn btn-sm btn-success modal-button mb-4">Create playlist</label>
        <input id="my-modal-6" type="checkbox" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle">
            <div class="modal-box bg-zinc-900">
                <h3 class="text-lg">Add a playlist to your Spotify account with all the songs from this game!</h3>
                <hr class="my-4 opacity-10" />
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text opacity-60">Playlist name</span>
                    </label>
                    <input v-model="playlistName" type="text" class="input input-bordered w-full max-w-xs bg-black" />
                </div>
                <div class="modal-action mb-4">
                    <label for="my-modal-6" class="btn btn-secondary">Close</label>
                    <label for="my-modal-6" class="btn btn-success" @click="compileAndCreatePlaylist">Create</label>
                </div>
            </div>
        </div>
        <div
            v-for="u in sortedUsers"
            :key="u.id"
            :class="u.points == highestScore ? 'fancy-card' : ''"
            class="flex flex-row items-center px-3 mt-4 border-zinc-800 shadow-xl rounded-2xl py-2"
        >
            <div class="avatar mr-4">
                <div class="w-14 rounded-full">
                    <img :src="u.img" />
                </div>
            </div>
            <div>
                <h1 class="font-bold">{{ u.name }}</h1>
                <p class="opacity-75 text-xs">{{ u.id }}</p>
                <p>
                    Points: <span class="text-success">{{ u.points * 10 }}</span>
                </p>
            </div>
            <button class="btn btn-sm btn-ghost shadow-xl ml-auto" @click="openResultModal(u)">DETAILS</button>
        </div>
        <div v-if="sortedUsers.length == 0">
            <hr class="my-4 opacity-20" />
            <p class="my-4 text-left text-xl italic text-white">Hmm i guess no one even played this one? Maybe everyone left before it even started.</p>
        </div>
        <Teleport to="#modal-target">
            <ResultModalComponent v-if="resultModal" :player="selectedPlayer" :room="room" @close="resultModal = false" />
        </Teleport>
    </div>
</template>

<script>
import PageTitle from './PageTitle.vue'
import ResultModalComponent from './ResultModalComponent.vue'

import { useUserStore } from '@/stores/user'
import { mapActions } from 'pinia'
export default {
    components: { PageTitle, ResultModalComponent },
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
            playlistName: 'Soundcheck: ' + this.$route.params.id,
            resultModal: false,
            selectedPlayer: null,
        }
    },
    computed: {
        sortedUsers() {
            let users = this.room_.users.slice()
            return users.sort((a, b) => b.points - a.points)
        },
        highestScore() {
            return this.sortedUsers[0].points
        },
        cssVars() {
            return {
                '--max-card-height': 150 + this.room.songs.length * 180 + 'px',
            }
        },
        style() {
            return {
                'background-color': this.linearGradient(),
            }
        },
        color1() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
        color2() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
        color3() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
        color4() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
    },
    mounted() {
        console.log(this.sortedUsers)
    },
    methods: {
        ...mapActions(useUserStore, ['createPlaylist']),
        compileAndCreatePlaylist() {
            this.createPlaylist(this.room.songs, this.playlistName)
        },
        openResultModal(player) {
            this.selectedPlayer = player
            this.resultModal = true
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

.gradiant-text {
    background: linear-gradient(to right, rgb(29, 184, 83), rgba(89, 225, 175, 0.978));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font: bold;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fancy-card {
    background: linear-gradient(-45deg, v-bind('color1'), v-bind('color2'), v-bind('color3'), v-bind('color4'));
    background-size: 400% 400%;
    animation: gradient 10s ease infinite;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
</style>
