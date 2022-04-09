<template>
    <div :key="item_type" class="flex flex-col px-8 pb-8 w-screen">
        <div class="pb-8">
            <h1 class="text-3xl text-center">Your top {{ item_type }}</h1>
            <p class="text-center">Choose the time range at the bottom.</p>
        </div>
        <div v-if="!loading" class="pb-12">
            <div v-if="items[item_type][time_range].length > 0" class="flex flex-col place-items-center">
                <div v-if="item_type == 'tracks'">
                    <SongCard
                        v-for="(item, index) in items[item_type][time_range]"
                        :key="item.id"
                        :img="item.album.images[0].url"
                        :artist="item.artists[0].name"
                        :index="index"
                        :title="item.name"
                        class="mb-4"
                    ></SongCard>
                </div>
                <div v-if="item_type == 'artists'">
                    <SongCard
                        v-for="(item, index) in items[item_type][time_range]"
                        :key="item.id"
                        :title="item.name"
                        :index="index"
                        :img="item.images[0].url"
                        class="mb-4"
                    ></SongCard>
                </div>
            </div>
            <div v-else class="flex flex-col p-8">
                <p>
                    You have no {{ item_type }} for this period.
                    <br />
                    Try another period at the bottom.
                </p>
            </div>
        </div>
        <div v-else class="flex flex-col items-center place-content-center mt-32">
            <div class="radial-progress text-primary animate-spin" style="--value: 70"></div>
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
            item_type: this.$route.params.id,
            time_range: 'medium_term',
            items: {
                tracks: {
                    short_term: [],
                    medium_term: [],
                    long_term: [],
                },
                artists: {
                    short_term: [],
                    medium_term: [],
                    long_term: [],
                },
            },
            loading: true,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'top_items']),
    },
    watch: {
        $route(oldVal, newVal) {
            if (newVal.params.id == 'artists' || newVal.params.id == 'tracks') {
                this.item_type = this.$route.params.id
                this.time_range = 'medium_term'
                this.getItems()
                this.loading = false
            }
        },
    },
    async mounted() {
        await this.getItems()
        this.loading = false
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs']),
        async toggleActive(e, time_range) {
            this.loading = true
            Array.from(document.getElementsByClassName('tab')).forEach((element) => {
                element.classList.remove('tab-active')
            })
            e.target.classList.toggle('tab-active')

            // Get top songs from store
            this.items[this.item_type][time_range] = await this.getTopSongs(time_range, 25, this.item_type)

            // Set time range
            this.time_range = time_range

            // stop loading
            this.loading = false
        },
        async getItems() {
            this.loading = true
            this.items[this.item_type][this.time_range] = await this.getTopSongs(this.time_range, 25, this.item_type)
            console.log('top items', this.items)
            this.loading = false
        },
    },
    sockets: {
        refreshToken(data) {
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
