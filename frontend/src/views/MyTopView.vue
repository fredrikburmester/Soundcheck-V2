<template>
    <div>
        <div :key="item_type" class="flex flex-col px-8 pb-24 w-screen items-center">
            <div class="pb-8 max-w-2xl w-full">
                <h1 class="text-3xl text-start font-bold">Your top {{ item_type }}</h1>
                <p>
                    <i class="text-gray-400"> Make sure to change the time range! </i>
                </p>
                <div v-if="item_type == 'tracks'">
                    <label for="my-modal-6" class="btn btn-sm btn-success modal-button mt-4" @click="setPlaylistName">Create playlist</label>
                    <input id="my-modal-6" type="checkbox" class="modal-toggle" />
                    <div class="modal modal-bottom sm:modal-middle">
                        <div class="modal-box bg-zinc-900">
                            <h3 class="font-bold text-lg">Save these 25 songs to a new Spotify playlist!</h3>
                            <hr class="my-4 opacity-10" />
                            <div class="form-control w-full max-w-xs">
                                <label class="label">
                                    <span class="label-text opacity-60">Playlist name</span>
                                </label>
                                <input v-model="playlistName" type="text" class="input input-bordered w-full max-w-xs bg-black" />
                            </div>
                            <div class="modal-action mb-12">
                                <label for="my-modal-6" class="btn btn-secondary">Close</label>
                                <label for="my-modal-6" class="btn btn-success" @click="compileAndCreatePlaylist">Create</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tabs tabs-boxed bg-zinc-900 shadow-lg mt-4">
                    <a class="tab bg-zinc-900 rounded-l-lg" @click="toggleActive($event, 'short_term')">Month</a>
                    <a class="tab tab-active bg-zinc-900" @click="toggleActive($event, 'medium_term')">Half Year</a>
                    <a class="tab bg-zinc-900 rounded-r-lg" @click="toggleActive($event, 'long_term')">Over a year</a>
                </div>
            </div>
            <div v-if="!loading" class="flex flex-col place-items-center w-full max-w-2xl list">
                <div v-if="item_type == 'tracks'">
                    <TransitionGroup name="fade" tag="div">
                        <SongCard
                            v-for="item in filteredItems(items)"
                            :key="item.uuid"
                            :song="item"
                            :unique="isUnique(item.data.popularity)"
                            :oldest="isOldest(item.dateAdded)"
                            class="mb-4"
                        ></SongCard>
                    </TransitionGroup>
                </div>
                <div v-else>
                    <ArtistCard
                        v-for="item in filteredItems(items)"
                        :key="item"
                        :unique="isUnique(item.data.popularity)"
                        :oldest="isOldest(item.dateAdded)"
                        :artist="item"
                        class="mb-4"
                    ></ArtistCard>
                </div>
            </div>
            <LoadingComponent v-if="loading || loadingMore" />
            <button v-if="!loadingMore && !loading" class="btn btn-sm btn-success" @click="loadMore">Load more</button>
        </div>
    </div>
</template>
<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import SongCard from '../components/SongCardComponent.vue'
import LoadingComponent from '../components/LoadingComponent.vue'
import ArtistCard from '../components/ArtistCardComponent.vue'

export default {
    components: { SongCard, LoadingComponent, ArtistCard },
    data() {
        return {
            item_type: this.$route.params.id,
            time_range: 'medium_term',
            items: [],
            loading: true,
            playlistName: '',
            loadingMore: false,
            amount: 25,
            lowestPopularity: 0,
            lowestPopularityIndex: 0,
            oldestDate: null,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'top_items']),
    },
    watch: {
        async $route(oldVal, newVal) {
            if (this.$route.name == 'MyTop') {
                if (newVal.params.id == 'artists' || newVal.params.id == 'tracks') {
                    this.item_type = this.$route.params.id
                    this.time_range = 'medium_term'
                    const topItems = await this.getTopSongs(this.time_range, 25, this.item_type)
                    console.log('[switched route]', topItems)
                    this.getTopItemsFromBackend(topItems, this.time_range, this.item_type)
                }
            }
        },
    },
    async mounted() {
        this.loading = true
        // await this.getItems()
        const topItems = await this.getTopSongs(this.time_range, 25, this.item_type)
        console.log('[mounted]', topItems)
        this.getTopItemsFromBackend(topItems, this.time_range, this.item_type)
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs', 'createPlaylist']),
        getTimeRangePrettyString(time_range) {
            if (time_range == 'short_term') {
                return 'Last month'
            } else if (time_range == 'medium_term') {
                return 'Last 6 months'
            } else if (time_range == 'long_term') {
                return 'Over a year'
            }
        },
        getItemTypePrettyString(item_type) {
            if (item_type == 'tracks') {
                return 'Songs'
            } else if (item_type == 'artists') {
                return 'artists'
            }
        },
        getPrettyDate() {
            const date = new Date()
            const month = date.getMonth() + 1
            const year = date.getFullYear().toString()
            return `${month}/${year.substring(2, 4)}`
        },
        filteredItems(items) {
            const type = this.item_type == 'tracks' ? 'track' : 'artist'
            const filteredItems = items.filter((item) => item.timeRange == this.time_range && item.type == type)

            // sort items based in index
            const sortedItems = filteredItems.sort((a, b) => {
                return a.index - b.index
            })
            console.log('[sorted items]', sortedItems)
            return sortedItems
        },
        setPlaylistName() {
            this.playlistName = `My Top ${this.getItemTypePrettyString(this.item_type)} - ${this.getTimeRangePrettyString(
                this.time_range
            )} (${this.getPrettyDate()})`
        },
        compileAndCreatePlaylist() {
            this.createPlaylist(this.filteredItems(this.items), this.playlistName)
        },
        async toggleActive(e, time_range) {
            this.loading = true
            Array.from(document.getElementsByClassName('tab')).forEach((element) => {
                element.classList.remove('tab-active')
            })
            e.target.classList.toggle('tab-active')

            // Set time range
            this.time_range = time_range
            this.amount = 25

            const topItems = await this.getTopSongs(this.time_range, this.amount, this.item_type)
            this.getTopItemsFromBackend(topItems, this.time_range, this.item_type)
        },

        getTopItemsFromBackend(topItems, timeRange, itemType) {
            this.$socket.client.emit('getTopItemsFromBackend', {
                topItems: topItems,
                itemType: itemType,
                timeRange: timeRange,
            })
        },
        async loadMore() {
            this.loadingMore = true
            this.amount += 5
            const topItems = await this.getTopSongs(this.time_range, this.amount, this.item_type)
            this.getTopItemsFromBackend(topItems, this.time_range, this.item_type)
        },
        isUnique(popularity) {
            return popularity == this.lowestPopularity || popularity <= 20
        },
        isOldest(date) {
            return date == this.oldestDate
        },
    },
    sockets: {
        sendTopItemsFromBackend(topItems) {
            let lowestPopularity = 100
            let oldestDate = new Date()
            for (let i = 0; i < topItems.length; i++) {
                const song = topItems[i]

                if (song.timeRange != this.time_range) {
                    continue
                }

                // Check for the oldest song
                if (new Date(song.dateAdded) < oldestDate) {
                    oldestDate = song.dateAdded
                }

                // Check the least popular song
                if (song.data.popularity < lowestPopularity) {
                    lowestPopularity = song.data.popularity
                }
            }

            this.lowestPopularity = lowestPopularity
            this.oldestDate = oldestDate

            this.items = topItems

            console.log('[from backend]', this.items)
            console.log('[oldest date]', oldestDate)
            console.log('[lowest popularity]', lowestPopularity)

            this.loading = false
            this.loadingMore = false
        },
    },
}
</script>
<style scoped>
.list {
}
.tabs {
    width: 278px;
    margin-left: -3px;
}
/* 
.list-leave-active {
    opacity: 0;
    position: absolute;
}

.list-move, 
.list-enter-active,
.list-leave-active {
    transition: all 1s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 1;
    transform: translateY(20px);
} */

.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 1s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
