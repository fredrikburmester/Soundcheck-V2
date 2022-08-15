<template>
    <transition appear name="fade">
        <div
            id="result-modal"
            class="fixed top-0 left-0 w-screen h-screen backdrop-brightness-50 backdrop-blur-md px-4 z-100 flex flex-col items-center overflow-scroll pb-24 pt-12"
        >
            <h1 class="text-white mt-4 text-2xl font-bold">Points: {{ player.points * 10 }}</h1>
            <p class="text-white opacity-70">Per song answers for {{ player.name }}</p>
            <div v-for="(song, index) in room.songs" :key="song.id" class="mt-6">
                <SongResultCard :index="index" :song="song" />
                <p class="text-white -mt-3 ml-3 opacity-70">Guess: {{ getGuessName(player.guesses, song.id) }}</p>
                <p class="text-white ml-3 opacity-70">Correct answer: {{ getCorrectAnswerName(song.id) }}</p>
            </div>
        </div>
    </transition>
    <div class="chat-close-button fixed top-8 right-8">
        <button class="btn btn-circle bg-red-600 border-0 shadow-xl" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>

<script>
import SongResultCard from './SongResultCardComponent.vue'

export default {
    components: { SongResultCard },
    props: {
        room: {
            type: Object,
            required: true,
        },
        player: {
            type: Object,
            required: true,
        },
    },
    emits: ['close'],
    mounted() {},
    methods: {
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
        close() {
            this.$emit('close')
        },
    },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.chat-close-button {
    z-index: 1001;
}
#result-modal {
    z-index: 1000;
}
</style>
