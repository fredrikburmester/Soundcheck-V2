<template>
    <Transition appear name="fade" mode="out-in">
        <div v-show="loaded" id="usercard" class="w-full card mb-4 flex flex-row items-center pl-6 max-w-96 bg-base-300 shadow-xl h-20 flex-shrink-0">
            <div class="indicator">
                <span v-if="indicator" class="indicator-item badge badge-primary">{{ indicator }}</span>
                <div v-if="user.img" class="avatar">
                    <div v-if="user.host" class="w-12 h-12 rounded-full ring ring-primary animate">
                        <img :src="user.img" @load="loaded = true" />
                    </div>
                    <div v-else class="w-12 h-12 rounded-full">
                        <img :src="user.img" @load="loaded = true" />
                    </div>
                </div>
                <div v-else class="avatar placeholder">
                    <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
                        <span class="text-3xl">{{ user.name[0] }}</span>
                    </div>
                </div>
            </div>

            <div class="card-body flex flex-col">
                <span class="card-title">{{ user.name }}</span>
                <transition appear name="slide">
                    <span v-if="description.length > 0" class="text-xs text-primary -mt-2" :style="descriptionStyle">{{ description }}</span>
                </transition>
            </div>
        </div>
    </Transition>
</template>
<script>
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
export default {
    props: {
        user: {
            type: Object,
            required: true,
        },
        host: {
            type: Boolean,
            default: false,
            required: false,
        },
        guessed: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    data() {
        return {
            loaded: false,
            description: '',
            descriptionStyle: {
                opacity: 0,
            },
            indicator: '',
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    mounted() {
        if (!this.user.img) {
            this.loaded = true
        }

        if (this.guessed) {
            this.description = 'Guessed!'
            this.descriptionStyle.opacity = 1
        }

        if (this.user.leftGame) {
            this.description = 'Left the game'
            this.descriptionStyle = {
                color: 'red',
            }
        }
    },
    updated() {
        if (this.guessed) {
            this.description = 'Guessed!'
            this.descriptionStyle.opacity = 1
        } else if (this.user.leftGame) {
            this.description = 'Left the game'
            this.descriptionStyle = {
                color: 'red',
            }
        } else {
            this.description = ''
            this.descriptionStyle.opacity = 0
        }
    },
    sockets: {
        userTyping(userId) {
            if (userId == this.user.id && userId != this.id) {
                this.indicator = 'typing...'
            }

            setTimeout(() => {
                this.indicator = ''
            }, 3000)
        },
    },
    methods: {},
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
}
.slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
