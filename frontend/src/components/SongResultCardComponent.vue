<template>
    <div>
        <transition name="fade" mode="out-in">
            <div v-show="loaded" class="indicator mb-4">
                <div class="card max-w-2xl bg-base-100 shadow-xl image-full mb-4" @click="expand">
                    <img :src="song.img" class="w-100" alt="album cover" @load="loaded = true" />
                    <div class="card-body py-2 px-4 flex flex-row pt-6">
                        <div class="flex flex-col w-full">
                            <div class="flex flex-row items-center">
                                <div class="flex flex-col items-start ml-4">
                                    <h2 :key="expanded" class="card-title text-sm">{{ shortText(song.name, 23) }}</h2>
                                    <p>{{ song.artist }}</p>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-success w-44 mt-6" @click="openInSpotify">Open in spotify</button>
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
    },
    data() {
        return {
            loaded: false,
            // heights: ['90px', '215px'],
            // height: '90px',
            initialHeight: 90,
            bigHeight: 140,
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
    sockets: {},
    methods: {
        openInSpotify() {
            window.open(this.song.data.external_urls.spotify, '_blank')
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
