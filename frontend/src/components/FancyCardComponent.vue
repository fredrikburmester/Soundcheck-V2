<template>
    <Transition appear name="slide">
        <div ref="card" :style="style" class="fancy-card flex flex-col bg-opacity-80 text-neutral-content rounded-xl p-6">
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
    computed: {
        style() {
            return {
                'background-color': this.linearGradient(),
            }
        },
        color1() {
            return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
        },
        color2() {
            return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
        },
        color3() {
            return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
        },
        color4() {
            return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
        },
    },
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
        linearGradient() {
            return `linear-gradient(-45deg, ${this.getRandomColor()}, ${this.getRandomColor()}, ${this.getRandomColor()}, ${this.getRandomColor()});`
        },
    },
}
</script>

<style>
.fancy-card {
    background: linear-gradient(-45deg, v-bind('color1'), v-bind('color2'), v-bind('color3'), v-bind('color4'));
    background-size: 400% 400%;
    animation: gradient 10s ease infinite;
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
    transform: translateX(30px);
}
.slide-leave-to {
    transform: translateX(30px);
}
</style>
