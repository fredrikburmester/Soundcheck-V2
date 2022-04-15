<template>
    <div>
        <h1 class="text-3xl font-bold">Guess!</h1>
        <SongCardComponent />
    </div>
</template>

<script>
import SongCardComponent from '../components/SongCardComponent.vue'
import { mapWritableState, mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'
export default {
    components: {
        SongCardComponent,
    },
    data() {
        return {
            songs: [],
            time_range: 'medium_term',
            limit: 25,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    sockets: {},
    async mounted() {
        this.songs = await this.getTopSongs(this.time_range, this.limit)
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs']),
    },
}
</script>
