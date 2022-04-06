<template>
    <Transition appear name="fade" mode="out-in">
        <div v-show="loaded" class="card max-w-lg bg-base-100 shadow-xl image-full h-36">
            <figure>
                <img :src="img" alt="album cover" @load="loaded = true" />
            </figure>
            <div class="card-body flex flex-row h-36 items-center">
                <p v-if="index" class="text-3xl opacity-50">#{{ index + 1 }}</p>
                <div class="text-right flex flex-col items-end">
                    <h2 class="card-title">{{ title }}</h2>
                    <p>{{ artist }}</p>
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
    computed: {},
    mounted() {},
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
