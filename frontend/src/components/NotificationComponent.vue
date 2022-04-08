<template>
    <transition name="fade" mode="out-in">
        <div v-if="notification" class="fixed bottom-0 left-0 p-8 animate-none">
            <div class="alert alert-warning shadow-lg flex flex-wrap flex-row">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-black flex-shrink-0 w-6 h-6">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <span>{{ notification }}</span>
                </div>
                <div class="flex-none">
                    <button class="btn btn-sm btn-primary" @click="notification = ''">Close</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'
export default {
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['notification']),
    },
    mounted() {
        // self destruct after 5 seconds
        setTimeout(() => {
            this.notification = ''
        }, 5000)
    },
    sockets: {},
    methods: {},
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateX(-500px);
    opacity: 0;
}
</style>
