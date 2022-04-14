<template>
    <Transition appear name="fade" mode="out-in">
        <div v-show="loaded" id="usercard" class="card mb-4 flex flex-row items-center pl-8 max-w-96 bg-base-300 shadow-xl h-20 flex-shrink-0">
            <div v-if="img" class="avatar">
                <div v-if="host" class="w-12 h-12 rounded-full ring ring-primary animate">
                    <img :src="img" @load="loaded = true" />
                </div>
                <div v-else class="w-12 h-12 rounded-full">
                    <img :src="img" @load="loaded = true" />
                </div>
            </div>
            <div v-else class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
                    <span class="text-3xl">{{ displayName[0] }}</span>
                </div>
            </div>
            <div class="card-body flex flex-col">
                <span class="card-title">{{ displayName }}</span>
                <transition appear name="slide">
                    <span v-if="description.length > 0" class="text-xs text-primary -mt-2">{{ description }}</span>
                </transition>
            </div>
        </div>
    </Transition>
</template>
<script>
export default {
    props: {
        img: {
            type: String,
            required: false,
        },
        displayName: {
            type: String,
            required: true,
        },
        host: {
            type: Boolean,
            required: false,
            default: false,
        },
        description: {
            type: String,
            required: false,
            default: '',
        },
    },
    data() {
        return {
            loaded: false,
        }
    },
    computed: {},
    mounted() {
        if (!this.img) {
            this.loaded = true
        }
    },
    sockets: {},
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
    transform: translateX(20px);
}
.slide-leave-to {
    transform: translateX(20px);
}
</style>
