<template>
    <Transition appear name="slide" mode="out-in">
        <div class="card h-24 bg-base-100 shadow-xl image-full mb-4">
            <img v-show="imgLoaded" :src="song.img" class="w-full" alt="album cover" @load="imgLoaded = true" />
            <div class="h-24 card-body flex flex-row items-center w-full justify-between">
                <transition appear name="fade">
                    <div v-if="connected" class="avatar w-20" style="transform: scale(0.8)" @click="togglePlay">
                        <div class="w-12 h-12">
                            <transition name="rotate">
                                <vue-feather v-if="!playing" type="play-circle" class="w-12 h-12"></vue-feather>
                                <vue-feather v-else type="pause-circle" class="w-12 h-12"></vue-feather>
                            </transition>
                        </div>
                    </div>
                </transition>
                <div v-if="loading" style="transform: scale(0.8)"><LoadingComponent color="#fff" /></div>
                <div class="text-right flex flex-col items-end w-full">
                    <h2 class="card-title text-sm">{{ shortText(song.name) }}</h2>
                    <p class="text-xs">{{ shortText(song.artist) }}</p>
                    <transition appear name="fade">
                        <input
                            v-if="connected"
                            v-model="seekPosition"
                            type="range"
                            min="0"
                            :max="duration"
                            class="range range-xs mt-2"
                            :disabled="!allowSeeking"
                            @change="seek"
                        />
                    </transition>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script>
import LoadingComponent from './LoadingComponent.vue'
export default {
    components: { LoadingComponent },
    props: {
        song: {
            type: Object,
            required: true,
        },
        connected: {
            type: Boolean,
            requred: true,
        },
        playerPosition: {
            type: Number,
            required: true,
        },
        allowSeeking: {
            type: Boolean,
            required: false,
            default: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        loading: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['play', 'pause', 'seek'],
    data() {
        return {
            imgLoaded: false,
            playing: false,
            seekPosition: this.playerPosition,
        }
    },
    watch: {
        song() {
            this.imgLoaded = false
            this.playing = false
            this.seekPosition = this.playerPosition
        },
        playerPosition(newVal, oldVal) {
            this.seekPosition = newVal
        },
    },
    mounted() {},
    methods: {
        shortText(text) {
            return text.length > 20 ? text.substring(0, 20) + '...' : text
        },
        seek() {
            this.$emit('seek', this.seekPosition)
        },
        togglePlay() {
            if (this.playing) {
                this.playing = false
                this.$emit('pause')
            } else {
                this.playing = true
                this.$emit('play')
            }
        },
    },
}
</script>

<style scoped>
.card-body {
    padding: 20px;
}
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.rotate-enter-active,
.rotate-leave-active {
    transition: all 0.2s ease-out;
}

.rotate-enter-from {
    opacity: 0;
    transform: rotate(-360deg);
}
.rotate-leave-to {
    /* opacity: 0; */
    transform: rotate(360deg);
}

.fade-enter-active,
.fade-leave-active {
    transition: all 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
