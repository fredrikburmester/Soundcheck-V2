<template>
    <div class="indicator" :style="style">
        <!-- <span v-if="newArtist()" class="indicator-item indicator-top indicator-start badge badge-info mt-36">New</span>
        <span v-if="unique && !(!newArtist() && oldest)" class="indicator-item badge badge-error z-100">Rare</span>
        <span v-if="!newArtist() && oldest && !unique" class="indicator-item badge badge-secondary z-100">Old</span>
        <span v-if="artist.previousIndex != null && artist.previousIndex < artist.index" class="indicator-item indicator-start badge badge-success"></span>
        <span v-if="artist.previousIndex != null && artist.previousIndex > artist.index" class="indicator-item indicator-start badge badge-error"></span> -->

        <!-- <template v-if="unique && !newArtist() && oldest">
            <span v-if="unique" class="indicator-item indicator-end badge badge-error z-100">Rare</span>
            <span v-if="!newArtist() && oldest" class="indicator-item badge badge-secondary z-100 -translate-x-8">Old</span>
        </template> -->

        <div v-show="loaded" class="card max-w-2xl bg-base-100 shadow-xl image-full mb-4" :style="style" @click="expand">
            <img :src="artist.data.images[0].url" class="w-100" alt="album cover" @load="loaded = true" />
            <div class="card-body py-2 px-4 flex flex-row pt-6" :style="style">
                <div class="flex flex-col w-full">
                    <div class="flex flex-row items-center">
                        <p class="text-3xl opacity-70">#{{ artist.index + 1 }}</p>
                        <div class="text-right flex flex-col items-end">
                            <h2 :key="expanded" class="card-title ml-4 text-sm overflow-hidden">
                                {{ shortText(artist.data.name, 23) }}
                            </h2>
                        </div>
                    </div>
                    <!-- open in spotify button -->

                    <div class="flex flex-col justify-start justify-self-end pt-12">
                        <div>
                            Top artist since: <span class="opacity-50">{{ dateString(artist.dateAdded) }}</span>
                        </div>
                        <!-- <div v-if="unique" class="text-error font-bold">Rare top artist!</div> -->
                        <!-- <div v-if="!newArtist() && oldest" class="text-secondary font-bold">Long time favuorite!</div> -->
                    </div>
                    <button class="btn btn-sm btn-success w-44 mt-2" @click="openInSpotify">Open in spotify</button>
                </div>
            </div>
        </div>
    </div>

    <!-- <div v-if="!loaded" class="placeholder-card max-w-2xl rounded-2xl animate-pulse"></div> -->
</template>
<script>
export default {
    props: {
        artist: {
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
            heights: ['90px', '190px'],
            height: '90px',
            expanded: false,
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
        newArtist() {
            return new Date(this.artist.dateAdded) > new Date() - 8.64e7 && this.artist.previousIndex == null
        },
        shortText(text, l) {
            return text.length > l ? `${text.substr(0, l)}...` : text
        },
        dateString(date) {
            if (!date) return ''
            return new Date(date).toLocaleDateString()
        },
        openInSpotify() {
            window.open(this.artist.data.external_urls.spotify)
        },
        expand() {
            this.expanded = !this.expanded
            if (this.height == this.heights[0]) {
                let newHeight = 190

                if (this.unique) {
                    newHeight += 22.5
                }

                if (this.artist.previousIndex != null && this.oldest) {
                    newHeight += 22.5
                }

                this.height = newHeight + 'px'
            } else {
                this.height = this.heights[0]
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

.arrow {
    height: 10px;
    width: 10px;
}
.indicator-item {
    z-index: 99;
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 4px;
    margin-right: 4px;
}
</style>
