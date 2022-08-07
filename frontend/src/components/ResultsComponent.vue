<template>
    <div id="results" class="px-4">
        <PageTitle>
            <template #header>
                <p class="text-xs opacity-50">Room code:</p>
                <p class="gradiant-text font-bold">
                    {{ $route.params.id }}
                </p>
            </template>
            <template #main> Check out the results by pressing a user below! </template>
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
        <div v-for="(p, i) in sortedUsers" :key="p.id">
            <p v-if="i == 0" class="text-xl font-bold mb-2 text-orange-500 italic">Winner</p>
            <p v-else-if="i > 0 && p.points == sortedUsers[i - 1].points"></p>
            <hr v-else class="opacity-10 mt-2 mb-4" />
            <UserCard :user="p" class="collapse-title w-full" @click="openResultModal(p)" />
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
import UserCard from './UserCard.vue'
import PageTitle from './PageTitle.vue'
import ResultModalComponent from './ResultModalComponent.vue'

import { useUserStore } from '@/stores/user'
import { mapActions } from 'pinia'
export default {
    components: { UserCard, PageTitle, ResultModalComponent },
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
</style>
