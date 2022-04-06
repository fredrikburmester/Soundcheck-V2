<template>
    <div class="px-8 p-8 md:p-12">
        <h1 class="text-3xl">Your top songs</h1>
        <p class="">Choose the time range at the bottom.</p>
    </div>
    <div v-if="!loading" class="pb-24">
        <div v-if="songs[time_range].length > 0" class="flex flex-col p-8 items-center w-screen">
            <div v-for="(song, index) in songs[time_range]" :key="song.id">
                <SongCard :img="song.album.images[0].url" :index="index" :title="song.name" :artist="song.artist" class="mb-8"></SongCard>
            </div>
        </div>
        <div v-else class="flex flex-col p-8 items-center w-screen">
            <p>
                You have no songs for this period.
                <br />
                Try another period at the bottom.
            </p>
        </div>
    </div>
    <div class="tabs tabs-boxed z-100 bg-primary">
        <a class="tab bg-base-100 rounded-l-lg" @click="toggleActive($event, 'short_term')">Month</a>
        <a class="tab tab-active bg-base-100" @click="toggleActive($event, 'medium_term')">Half Year</a>
        <a class="tab bg-base-100 rounded-r-lg" @click="toggleActive($event, 'long_term')">Over a year</a>
    </div>
</template>
<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import SongCard from '../components/SongCard.vue'

export default {
    components: { SongCard },
    data() {
        return {
            type: 'tracks',
            time_range: 'medium_term',
            songs: [],
            loading: true,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'top_songs']),
    },
    async mounted() {
        this.songs[this.time_range] = await this.getTopSongs(this.time_range)
        this.loading = false
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs']),
        async toggleActive(e, time_range) {
            Array.from(document.getElementsByClassName('tab')).forEach((element) => {
                element.classList.remove('tab-active')
            })
            e.target.classList.toggle('tab-active')

            // Get top songs from store
            this.songs[time_range] = await this.getTopSongs(time_range)

            // Set time range
            this.time_range = time_range
        },
    },
    sockets: {
        refreshToken(data) {
            console.log('refreshing token...')
            this.token = data.token
        },
    },
}
</script>
<style scoped>
.tabs {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 278px;
}
</style>
