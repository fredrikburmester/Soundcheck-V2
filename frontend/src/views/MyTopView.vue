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
            <transition name="fade" mode="out-in">
                <div v-if="item_type == 'tracks' && !loadingStats && !loading" class="mb-8 flex flex-col">
                    <div class="flex flex-row">
                        <div class="flex flex-col scale-75 -m-2">
                            <div class="radial-progress text-primary text-xl text-xl" :style="`--value: ${noDecimalPoints(features.danceability * 100)};`">
                                {{ noDecimalPoints(features.danceability * 100) }}%
                            </div>
                            <span class="text-center mt-2">Dance</span>
                        </div>
                        <div class="flex flex-col scale-75 -m-2">
                            <div class="radial-progress text-primary text-xl" :style="`--value: ${noDecimalPoints(features.energy * 100)};`">
                                {{ noDecimalPoints(features.energy * 100) }}%
                            </div>
                            <span class="text-center mt-2">Energy</span>
                        </div>
                        <div class="flex flex-col scale-75 -m-2">
                            <div class="radial-progress text-primary text-xl" :style="`--value: ${noDecimalPoints(features.acousticness * 100)};`">
                                {{ noDecimalPoints(features.acousticness * 100) }}%
                            </div>
                            <span class="text-center mt-2">Acoustic</span>
                        </div>
                        <div class="flex flex-col scale-75 -m-2">
                            <div class="radial-progress text-primary text-xl" :style="`--value: ${noDecimalPoints(features.instrumentalness * 100)};`">
                                {{ noDecimalPoints(features.instrumentalness * 100) }}%
                            </div>
                            <span class="text-center mt-2">Instrument</span>
                        </div>
                        <div class="flex flex-col scale-75 -m-2">
                            <div class="radial-progress text-primary text-xl" :style="`--value: ${noDecimalPoints(features.liveness * 100)};`">
                                {{ noDecimalPoints(features.liveness * 100) }}%
                            </div>
                            <span class="text-center mt-2">Liveness</span>
                        </div>
                    </div>
                    <div>
                        <p class="font-bold text-xl mt-4 flex flex-col">
                            <progress
                                :class="progressClass(20 - -features.loudness.toFixed(2))"
                                :value="`${20 - -features.loudness.toFixed(2)}`"
                                max="20"
                            ></progress>
                            <span class="opacity-75 text-sm my-2">Loudness: {{ features.loudness.toFixed(2) }}dB </span>
                        </p>
                    </div>
                </div>
            </transition>
            <transition name="fade" mode="out-in">
                <div v-if="item_type == 'artists' && !loadingStats && !loading" class="mb-8 flex flex-col w-full max-4-3xl items-center">
                    <div v-for="genre in genres.slice(0, 5)" :key="genre" class="flex flex-col max-w-3xl w-full">
                        <div class="flex flex-col my-1">
                            <p class="capitalize">{{ genre.name }}</p>
                            <progress class="progress progress-primary w-100 bg-gray-700" :value="genre.count" :max="genres.length"></progress>
                        </div>
                    </div>
                </div>
            </transition>
            <LoadingComponent v-if="loadingStats" class="-mt-0" />

            <div v-if="!loading" class="flex flex-col place-items-center w-full max-w-2xl list">
                <div v-if="item_type == 'tracks'">
                    <TransitionGroup name="fade" tag="div">
                        <SongCard v-for="item in topItems" :key="item.uuid" :song="item" class="mb-4" :oldest="oldestSong" :index="item.index"></SongCard>
                    </TransitionGroup>
                </div>
                <div v-else>
                    <ArtistCard v-for="item in topItems" :key="item.id" :artist="item" class="mb-4"></ArtistCard>
                </div>
            </div>
            <div v-if="loading || loadingMore" style="min-height: 2000px">
                <LoadingComponent />
            </div>
            <transition name="fade" mode="out-in">
                <button v-if="!loadingMore" id="loadMoreButton" class="btn btn-sm btn-success" @click="loadMoreTopSongs">Load more</button>
            </transition>
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
            topItems: [],
            loading: true,
            playlistName: '',
            loadingMore: false,
            amount: 25,
            lowestPopularity: 0,
            lowestPopularityIndex: 0,
            oldestSong: null,
            features: {
                danceability: 0,
                energy: 0,
                acousticness: 0,
                instrumentalness: 0,
                liveness: 0,
                valence: 0,
                loudness: 0,
            },
            loadingStats: true,
            genres: [],
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

                    this.amount = 25
                    this.topItems = []
                    this.loadTopItems()
                }
            }
        },
    },
    async mounted() {
        this.loadTopItems()
    },
    sockets: {
        getOldestSavedSong({ uuid }) {
            this.oldestSong = uuid
        },
    },
    methods: {
        ...mapActions(useUserStore, ['getTopSongs', 'getMoreTopSongs', 'createPlaylist', 'getSongFeatures']),
        getTimeRangePrettyString(time_range) {
            if (time_range == 'short_term') {
                return 'Last month'
            } else if (time_range == 'medium_term') {
                return 'Last 6 months'
            } else if (time_range == 'long_term') {
                return 'Over a year'
            }
        },
        progressClass(value) {
            const correctedValue = 20 - value

            if (correctedValue < 10) {
                return 'progress w-100 bg-gray-700 progress-success'
            } else if (correctedValue < 15) {
                return 'progress w-100 bg-gray-700 progress-warning'
            } else {
                return 'progress w-100 bg-gray-700 progress-error'
            }
        },
        noDecimalPoints(float) {
            return float.toFixed(0)
        },
        isGenericGenre(genre) {
            const genericGenreWords = ['hip hop', 'pop', 'rock', 'metal', 'rap', 'electronic', 'lo-fi', 'dubstep']
            for (let word of genericGenreWords) {
                if (genre.includes(word)) {
                    return word
                }
            }
            return genre
        },
        isCombinedGenre(genre) {
            const combinedGenres = ['hip hop', 'stomp and holler', 'drum and bass', 'fourth world', 'rap', 'electronic', 'lo-fi', 'dubstep']

            for (let combinedGenre of combinedGenres) {
                if (genre == combinedGenre) {
                    return true
                }
            }
            return false
        },
        getArtistGenres() {
            //
            if (this.item_type != 'artists') {
                return
            }

            this.loadingStats = true

            let localGenres = []
            let genreCount = 0

            for (let artist of this.topItems) {
                const genres = artist.data.genres

                // Count the occurences of all genres
                for (let genre of genres) {
                    genre = this.isGenericGenre(genre)

                    let getGenre = localGenres.find((g) => g.name === genre)
                    if (getGenre === undefined) {
                        let genreArr = null
                        if (this.isCombinedGenre(genre)) {
                            genreArr = [genre]
                        } else {
                            genreArr = genre.split(' ')
                        }
                        for (let word of genreArr) {
                            if (word == 'and') {
                                continue
                            }
                            let getWord = localGenres.find((g) => g.name === word)

                            if (getWord === undefined) {
                                const obj = {
                                    name: word,
                                    count: 1,
                                }
                                localGenres.push(obj)
                            } else {
                                getWord.count++
                            }
                        }
                    } else {
                        getGenre.count++
                    }
                }
            }

            localGenres = localGenres
                .sort((a, b) => {
                    return a.count - b.count
                })
                .reverse()

            this.genres = localGenres
            this.genreCount = genreCount
            this.loadingStats = false
        },
        async getFeatures() {
            if (this.item_type != 'tracks') {
                this.loadingStats = false
                return
            }

            this.loadingStats = true
            let localFeatures = {
                danceability: 0,
                energy: 0,
                acousticness: 0,
                instrumentalness: 0,
                liveness: 0,
                valence: 0,
                loudness: 0,
            }

            let ids = []

            for (let item of this.topItems) {
                ids.push(item.id)
            }

            const newFeatures = await this.getSongFeatures(ids)

            for (let feature of newFeatures) {
                localFeatures.danceability += feature.danceability
                localFeatures.energy += feature.energy
                localFeatures.speechiness += feature.speechiness
                localFeatures.acousticness += feature.acousticness
                localFeatures.instrumentalness += feature.instrumentalness
                localFeatures.liveness += feature.liveness
                localFeatures.loudness += feature.loudness
            }

            // divide each key with the amount of items
            for (let key in localFeatures) {
                localFeatures[key] /= newFeatures.length
            }

            this.features = localFeatures

            this.loadingStats = false
        },
        getOldestStoredSong() {
            this.$socket.client.emit('getOldestSavedSong', { timeRange: this.time_range, itemType: this.item_type })
        },
        async loadTopItems() {
            /*
            Get song items from spotify API
            Send the relevant information about the user top items to the backend
            */
            this.loading = true

            this.topItems = await this.getTopSongs(this.time_range, 25, this.item_type)

            this.amount = this.topItems.length

            // Strip information that does not need to be sent to the backend
            const topItemsMap = this.topItems.map((item) => {
                return {
                    id: item.id,
                    uuid: item.uuid,
                    index: item.index,
                    previousIndex: item.previousIndex,
                    timeRange: item.timeRange,
                    itemType: item.itemType,
                    dateAdded: item.dateAdded,
                }
            })

            this.$socket.client.emit('topItemsMapFromClient', { topItemsMap, timeRange: this.time_range, itemType: this.item_type, limit: this.amount }, () => {
                this.loading = false
                this.getOldestStoredSong()
                this.getFeatures()

                if (this.item_type == 'artists') {
                    this.getArtistGenres()
                }
            })
        },
        async loadMoreTopSongs() {
            this.loadingMore = true

            const limit = 5
            const offset = this.topItems.length

            this.topItems = await this.getMoreTopSongs(this.time_range, this.item_type, limit, offset)

            this.amount = this.topItems.length

            // Strip information that does not need to be sent to the backend
            const topItemsMap = this.topItems.map((item) => {
                return {
                    id: item.id,
                    uuid: item.uuid,
                    index: item.index,
                    previousIndex: item.previousIndex,
                    timeRange: item.timeRange,
                    itemType: item.itemType,
                    dateAdded: item.dateAdded,
                }
            })

            this.$socket.client.emit('topItemsMapFromClient', { topItemsMap, timeRange: this.time_range, itemType: this.item_type, limit: this.amount }, () => {
                this.loadingMore = false
                this.getOldestStoredSong()
            })
        },
        calculateOldestSong() {
            let oldestDate = new Date()
            for (let song of this.topItems) {
                if (new Date(song.dateAdded) < oldestDate) {
                    this.oldestDate = song.dateAdded
                }
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
        async toggleActive(e, time_range) {
            this.loading = true
            Array.from(document.getElementsByClassName('tab')).forEach((element) => {
                element.classList.remove('tab-active')
            })
            e.target.classList.toggle('tab-active')

            // Set time range
            this.time_range = time_range
            this.amount = 25

            this.loadTopItems()
        },
        setPlaylistName() {
            this.playlistName = `My Top ${this.getItemTypePrettyString(this.item_type)} - ${this.getTimeRangePrettyString(
                this.time_range
            )} (${this.getPrettyDate()})`
        },
        compileAndCreatePlaylist() {
            this.createPlaylist(this.topItems, this.playlistName)
        },
    },
}
</script>
<style scoped>
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

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
}
</style>
