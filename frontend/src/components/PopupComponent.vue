<template>
    <transition name="fade" mode="out-in">
        <div v-if="notification" class="fixed bottom-0 left-0 p-8 animate-none">
            <div id="popupBackground" :class="backgroundClasses">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" :class="iconClasses">
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
                    <button :class="buttonClasses" @click="notification = ''">Close</button>
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
        ...mapWritableState(useUserStore, ['notification', 'notificationType']),
        backgroundClasses() {
            return {
                alert: true,
                'bg-zinc-900': this.notificationType === 'success' || false,
                'alert-warning': this.notificationType == 'error' || false,
                'shadow-lg': true,
                flex: true,
                'flex-wrap': true,
                'flex-row': true,
                'min-w-64': true,
            }
        },
        buttonClasses() {
            return {
                btn: true,
                'btn-sm': true,
                'btn-success': this.notificationType === 'success' || false,
                'btn-warning': this.notificationType === 'error' || false,
                'shadow-lg': true,
            }
        },
        iconClasses() {
            return {
                'stroke-white': this.notificationType === 'success' || false,
                'stroke-black': this.notificationType === 'error' || false,
                'flex-shrink-0': true,
                'w-6': true,
                'h-6': true,
            }
        },
    },
    mounted() {
        setTimeout(() => {
            this.notification = ''
        }, 3000)
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
#popupBackground {
    min-width: 250px;
}
</style>
