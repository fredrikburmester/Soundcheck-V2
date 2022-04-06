<template>
    <Transition appear name="fade" mode="out-in">
        <div v-show="loaded" class="card flex flex-row items-center pl-8 max-w-96 bg-base-300 shadow-xl h-24">
            <div v-if="img" class="avatar">
                <div class="w-12 h-12 rounded-full">
                    <img :src="img" @load="loaded = true" />
                </div>
            </div>
            <div v-else class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-content rounded-full w-24">
                    <span class="text-3xl">K</span>
                </div>
            </div>
            <div class="card-body">
                <h2 class="card-title">{{ displayName }}</h2>
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

<style>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
</style>