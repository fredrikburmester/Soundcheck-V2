<template>
    <div id="results" class="px-8">
        <PageTitle :title="$route.params.id" subtitle="Check out the results by pressing a user below!" />

        <div v-for="p in sortedUsers" :key="p.id" tabindex="0" class="collapse">
            <UserCard :img="p.img" :display-name="p.name" class="collapse-title" @click="openGuesses(p.id)" />
            <input type="checkbox" class="peer" />
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
import SongCard from './SongCard.vue'
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
        }
    },
    computed: {
        sortedUsers() {
            let users = this.room_.users.slice()
            return users.sort((a, b) => b.points - a.points)
        },
    },
    mounted() {
        console.log(this.room)
    },
    methods: {
        openGuesses(id) {
            // this.$emit('openGuesses', id);
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
            console.log(guesses, songId)
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
.collapse-content {
    transform: translateY(-20px);
    z-index: 1;
}
#results {
    padding-bottom: 50px;
}
</style>
