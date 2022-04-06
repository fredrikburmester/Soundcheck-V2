<template>
    <Transition appear name="fade" mode="out-in">
        <div v-show="loaded" class="card max-w-96 bg-base-100 shadow-xl image-full h-36">
            <figure>
                <img :src="img" alt="album cover" @load="loaded = true" />
            </figure>
            <div class="card-body flex flex-row h-36 items-center justify-items-start">
                <p class="text-3xl opacity-50">#{{ index + 1 }}</p>
                <h2 class="card-title text-right">{{ title }}</h2>
                <!-- <p>{{ artist }}</p> -->
            </div>
        </div>
    </Transition>
</template>
<script>
export default {
    props: {
        index: {
            type: Number,
            required: true,
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
