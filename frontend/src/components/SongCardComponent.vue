<template>
    <div>
        <transition name="fade" mode="out-in">
            <div v-show="loaded" class="indicator">
                <!-- <span v-if="newSong()" class="indicator-item indicator-top indicator-start badge badge-info mt-36">New</span> -->
                <span v-if="unique && !(!newSong() && oldest)" class="indicator-item badge badge-error z-100">Rare</span>
                <span v-if="!newSong() && oldest && !unique" class="indicator-item badge badge-secondary z-100">Old</span>
                <span v-if="song.previousIndex != null && song.previousIndex > song.index" class="indicator-item indicator-start badge badge-success">↑</span>
                <span v-if="song.previousIndex != null && song.previousIndex < song.index" class="indicator-item indicator-start badge badge-error">↓</span>

                <template v-if="unique && !newSong() && oldest">
                    <span v-if="unique" class="indicator-item indicator-end badge badge-error z-100">Rare</span>
                    <span v-if="!newSong() && oldest" class="indicator-item badge badge-secondary z-100 -translate-x-8">Old</span>
                </template>

                <div class="card max-w-2xl bg-base-100 shadow-xl image-full mb-4" @click="expand">
                    <img :src="song.data.album.images[0].url" class="w-100" alt="album cover" @load="loaded = true" />
                    <div class="card-body py-2 px-4 flex flex-row pt-6">
                        <div class="flex flex-col w-full">
                            <div class="flex flex-row items-center">
                                <p v-if="song.index != undefined" class="text-3xl opacity-50">#{{ song.index + 1 }}</p>
                                <div v-if="song.index != undefined" class="text-right flex flex-col items-end">
                                    <h2 :key="expanded" class="card-title ml-4 text-sm overflow-hidden">
                                        {{ shortText(song.data.name, 23) }}
                                    </h2>
                                    <p>{{ song.data.artists[0].name }}</p>
                                </div>
                                <div v-else class="flex flex-col items-start">
                                    <h2 :key="expanded" class="card-title ml-4 text-sm">{{ shortText(song.data.name, 23) }}</h2>
                                    <p>{{ song.data.artists[0].name }}</p>
                                </div>
                            </div>
                            <div class="flex flex-col justify-start justify-self-end pt-12">
                                <div>
                                    Album: <span class="opacity-50">{{ shortText(song.data.album.name, 23) }}</span>
                                </div>
                                <div>
                                    Top song since: <span class="opacity-50">{{ dateString(song.dateAdded) }}</span>
                                </div>
                                <div v-if="unique" class="text-error font-bold">Unpopular song!</div>
                                <div v-if="!newSong() && oldest" class="text-secondary font-bold">Long time favuorite!</div>
                            </div>
                            <button class="btn btn-sm btn-success w-44 mt-2" @click="openInSpotify">Open in spotify</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    props: {
        song: {
            type: Object,
            required: false,
        },
        unique: {
            type: Boolean,
            required: false,
        },
        oldest: {
            type: Boolean,
            required: false,
        },
    },
    data() {
        return {
            loaded: false,
            // heights: ['90px', '215px'],
            // height: '90px',
            initialHeight: 90,
            bigHeight: 215,
            expanded: false,
            height: 90,
        }
    },
    computed: {
        style() {
            return {
                height: this.height,
                width: '100%',
            }
        },
    },
    mounted() {},
    sockets: {},
    methods: {
        openInSpotify() {
            window.open(this.song.data.external_urls.spotify, '_blank')
        },
        newSong() {
            return new Date(this.song.dateAdded) > new Date() - 8.64e7 || this.song.previousIndex == null
        },
        shortText(text, l) {
            return text.length > l ? `${text.substr(0, l)}...` : text
        },
        dateString(date) {
            if (!date) return ''
            return new Date(date).toLocaleDateString()
        },
        expand() {
            this.expanded = !this.expanded
            if (this.height == this.initialHeight) {
                let newHeight = this.bigHeight

                if (this.unique) {
                    newHeight += 22.5
                }

                if (this.song.previousIndex != null && this.oldest) {
                    newHeight += 22.5
                }

                this.height = newHeight
            } else {
                this.height = this.initialHeight
            }
        },
    },
}
</script>

<style scoped>
.placeholder-card {
    width: 640px;
    height: 90px;
    background-color: rgb(70, 70, 70);
}
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
img {
    width: 100%;
    overflow: hidden;
}
.card-title {
    color: white;
}
.badge {
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 4px;
    margin-right: 4px;
}
.arrow {
    height: 10px;
    width: 10px;
}
.indicator-item {
    z-index: 99;
}

.card,
.card-body,
.indicator {
    height: v-bind(height + 'px');
    transition: all 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
}
</style>
