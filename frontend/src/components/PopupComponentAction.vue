<template>
    <transition name="fade" mode="out-in">
        <div v-if="notificationAction" class="fixed bottom-0 left-0 p-8 animate-none">
            <div id="popupBackground" :class="backgroundClasses">
                <span class="countdown font-mono text-lg mr-2">
                    <span :style="`--value: ${countdownValue}`"></span>
                </span>
                <span>{{ notificationActionMessage }}</span>
                <button :class="buttonClasses" @click="run">{{ notificationActionButtonText }}</button>
            </div>
        </div>
    </transition>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'
export default {
    data() {
        return {
            countdownValue: 30,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, [
            'notificationAction',
            'notificationActionFunction',
            'notificationActionMessage',
            'notificationActionType',
            'notificationActionButtonText',
            'notificationActionStop',
        ]),
        backgroundClasses() {
            return {
                alert: true,
                'bg-zinc-900': this.notificationActionType === 'success' || false,
                'alert-warning': this.notificationActionType == 'error' || false,
                'shadow-lg': true,
                'min-w-64': true,
            }
        },
        buttonClasses() {
            return {
                btn: true,
                'btn-sm': true,
                'btn-success': this.notificationActionType === 'success' || false,
                'btn-warning': this.notificationActionType === 'error' || false,
                'shadow-lg': true,
                'm-0': true,
                'px-3': true,
            }
        },
        iconClasses() {
            return {
                'stroke-white': this.notificationActionType === 'success' || false,
                'stroke-black': this.notificationActionType === 'error' || false,
                'flex-shrink-0': true,
                'w-6': true,
                'h-6': true,
            }
        },
    },
    mounted() {
        // decrease countdown value 1 every second
        setInterval(() => {
            this.countdownValue--
            if (this.countdownValue === 0) {
                this.notificationAction = false
            }
        }, 1000)
    },
    methods: {
        run() {
            this.notificationAction = false
            this.notificationActionFunction()
        },
    },
    sockets: {},
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
    display: flex;
    flex-direction: row;
    align-items: center !important;
    justify-content: center !important;
}
span,
button {
    margin: 0 !important;
}
</style>
