<template>
    <Transition appear name="fade" mode="out-in">
        <div v-show="loaded" class="card max-w-3xl bg-base-100 shadow-xl image-full h-24">
            <img :src="img" class="w-100" alt="album cover" @load="loaded = true" />

            <div class="card-body flex flex-row h-24 items-center">
                <div class="flex flex-col w-full">
                    <div class="flex flex-row items-center">
                        <p v-if="index != undefined" class="text-3xl opacity-50">#{{ index + 1 }}</p>
                        <div v-if="index != undefined" class="text-right flex flex-col items-end">
                            <h2 class="card-title">{{ shortTitle }}</h2>
                            <p>{{ artist }}</p>
                        </div>
                        <div v-else class="flex flex-col items-start">
                            <h2 class="card-title">{{ shortTitle }}</h2>
                            <p>{{ artist }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script>
export default {
    props: {
        index: {
            type: Number,
            required: false,
        },
        img: {
            type: String,
            required: false,
        },
        title: {
            type: String,
            required: true,
        },
        artist: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            loaded: false,
        }
    },
    computed: {
        shortTitle() {
            return this.title.length > 20 ? `${this.title.substr(0, 20)}...` : this.title
        },
    },
    mounted() {},
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
img {
    width: 100%;
}
.card-title {
    color: white;
}
</style>
