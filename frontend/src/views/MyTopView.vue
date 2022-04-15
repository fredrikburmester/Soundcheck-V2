<template>
    <div>
        <div :key="item_type" class="flex flex-col px-8 pb-24 w-screen items-center">
            <div class="pb-8 max-w-2xl w-full">
                <h1 class="text-3xl text-start">Your top {{ item_type }}</h1>
                <p v-if="item_type == 'tracks'" class="text-start">
                    Here you can see your favorite Spotify songs the last month, half year and more than a year.
                </p>
                <p v-if="item_type == 'artists'" class="text-start">
                    Here you can see your favorite Spotify artists the last month, half year and more than a year.
                </p>
                <br />
                <p>Make sure to change the time range at the bottom!</p>

                <div v-if="item_type == 'tracks'">
                    <label for="my-modal-6" class="btn btn-sm btn-success modal-button mt-4" @click="setPlaylistName">Create playlist</label>
                    <input id="my-modal-6" type="checkbox" class="modal-toggle" />
                    <div class="modal modal-bottom sm:modal-middle">
                        <div class="modal-box bg-zinc-900">
                            <h3 class="font-bold text-lg">Create a Spotify playlist with your top songs!</h3>
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
                </div>
            </div>
            <div v-if="!loading && items[item_type][time_range].length > 0" class="flex flex-col place-items-center w-full max-w-2xl">
                <div v-if="item_type == 'tracks'">
                    <TransitionGroup name="list" tag="div">
                        <SongCard
                            v-for="(item, index) in items[item_type][time_range]"
                            :key="item"
                            :img="item.album.images[0].url"
                            :artist="item.artists[0].name"
                            :index="index"
                            :title="item.name"
                            class="mb-4"
                        ></SongCard>
                    </TransitionGroup>
                </div>
                <div v-if="item_type == 'artists'">
                    <TransitionGroup name="list" tag="div">
                        <SongCard
                            v-for="(item, index) in items[item_type][time_range]"
                            :key="item.id"
                            :title="item.name"
                            :index="index"
                            :img="item.images[0].url"
                            class="mb-4"
                        ></SongCard>
                    </TransitionGroup>
                </div>
            </div>
            <div v-if="!loading && items[item_type][time_range].length == 0" class="flex flex-col p-8">
                <p>
                    You have no {{ item_type }} for this period.
                    <br />
                    Try another period at the bottom.
                </p>
            </div>
            <div v-if="loading" class="flex flex-col items-center place-content-center mt-32">
                <!-- <div class="radial-progress text-primary animate-spin" style="--value: 70"></div> -->
                <div class="hollow-dots-spinner" :style="spinnerStyle">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>

        <div class="tabs tabs-boxed z-100 bg-zinc-900 shadow-lg">
            <a class="tab bg-zinc-900 rounded-l-lg" @click="toggleActive($event, 'short_term')">Month</a>
            <a class="tab tab-active bg-zinc-900" @click="toggleActive($event, 'medium_term')">Half Year</a>
            <a class="tab bg-zinc-900 rounded-r-lg" @click="toggleActive($event, 'long_term')">Over a year</a>
        </div>
    </div>
</template>
<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'
import SongCard from '../components/SongCardComponent.vue'

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
            playlistName: '',
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['refresh_token', 'token', 'top_items']),
    },
    watch: {
        $route(oldVal, newVal) {
            if (this.$route.name == 'MyTop') {
                if (newVal.params.id == 'artists' || newVal.params.id == 'tracks') {
                    this.item_type = this.$route.params.id
                    this.time_range = 'medium_term'
                    this.getItems()
                    this.loading = false
                }
            }
        },
    },
    async mounted() {
        this.loading = true
        await this.getItems()
    },
    methods: {
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
        setPlaylistName() {
            this.playlistName = `My Top ${this.getItemTypePrettyString(this.item_type)} - ${this.getTimeRangePrettyString(
                this.time_range
            )} (${this.getPrettyDate()})`
        },
        compileAndCreatePlaylist() {
            let tracks = this.items[this.item_type][this.time_range]
            this.createPlaylist(tracks, this.playlistName)
        },
        ...mapActions(useUserStore, ['getTopSongs', 'createPlaylist']),
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
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 278px;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
    position: absolute;
}
.hollow-dots-spinner,
.hollow-dots-spinner * {
    box-sizing: border-box;
}

.hollow-dots-spinner {
    height: 15px;
    width: calc(30px * 3);
}

.hollow-dots-spinner .dot {
    width: 15px;
    height: 15px;
    margin: 0 calc(15px / 2);
    border: calc(15px / 5) solid #1eb854;
    border-radius: 50%;
    float: left;
    transform: scale(0);
    animation: hollow-dots-spinner-animation 1000ms ease infinite 0ms;
}

.hollow-dots-spinner .dot:nth-child(1) {
    animation-delay: calc(300ms * 1);
}

.hollow-dots-spinner .dot:nth-child(2) {
    animation-delay: calc(300ms * 2);
}

.hollow-dots-spinner .dot:nth-child(3) {
    animation-delay: calc(300ms * 3);
}

@keyframes hollow-dots-spinner-animation {
    50% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
</style>
