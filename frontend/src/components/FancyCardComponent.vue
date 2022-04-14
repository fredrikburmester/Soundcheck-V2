<template>
    <Transition appear name="slide">
        <div ref="card" class="fancy-card flex flex-col bg-opacity-80 bg-gradient-to-r bg-primary text-neutral-content rounded-xl p-8">
            <h1 class="font-bold text-2xl"><slot name="header"></slot></h1>
            <p><slot name="body"></slot></p>
            <router-link :to="link" class="place-self-end">
                <button class="btn bg-primary hover:bg-green-600 border-0 mt-4 whitespace-nowrap shadow-sm text-white">
                    <slot name="action"></slot>
                </button>
            </router-link>
        </div>
    </Transition>
</template>

<script>
export default {
    props: {
        link: {
            type: String,
            default: '/',
            required: true,
        },
    },
    data() {
        return {}
    },
    computed: {},
    mounted() {},
    sockets: {},
    methods: {
        getRandomColor() {
            let colors = ['#136F63', '#5603AD', '#E6AF2E', '#420C14', '#8F2D56', '#362C28', '#3B8EA5', '#011936']
            let color = colors[Math.floor(Math.random() * colors.length)]
            return color
        },
        hexToRgb() {
            let hex = this.getRandomColor()
            let rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
            return `rgb(${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)}, 0.5)`
        },
    },
}
</script>

<style>
.fancy-card {
    background: linear-gradient(-45deg, #18ba18, #2388d5);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s ease;
}

.slide-enter-from {
    transform: translateX(40px);
}
.slide-leave-to {
    transform: translateX(40px);
}
</style>
