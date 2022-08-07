<template>
    <div v-show="loaded" class="card max-w-2xl bg-base-100 shadow-xl image-full mb-4" :style="style" @click="expand">
        <img :src="img" class="w-100" alt="album cover" @load="loaded = true" />
        <div class="card-body py-2 px-4 flex flex-row items-center" :style="style">
            <div class="flex flex-col w-full">
                <div class="flex flex-row items-center">
                    <p v-if="index != undefined" class="text-3xl opacity-50">#{{ index + 1 }}</p>
                    <div v-if="index != undefined" class="text-right flex flex-col items-end">
                        <h2 :key="expanded" class="card-title ml-4 text-sm">{{ expanded ? title : shortTitle }}</h2>
                        <p v-if="artist">{{ artist }}</p>
                    </div>
                    <div v-else class="flex flex-col items-start">
                        <h2 :key="expanded" class="card-title ml-4 text-sm">{{ expanded ? title : shortTitle }}</h2>
                        <p v-if="artist">{{ artist }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- <div v-if="!loaded" class="placeholder-card max-w-2xl rounded-2xl animate-pulse"></div> -->
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
            heights: ['90px', '300px'],
            height: '90px',
            expanded: false,
        }
    },
    computed: {
        shortTitle() {
            return this.title.length > 23 ? `${this.title.substr(0, 23)}...` : this.title
        },
        style() {
            return {
                height: this.height,
            }
        },
    },
    mounted() {},
    sockets: {},
    methods: {
        expand() {
            this.expanded = !this.expanded
            console.log(this.expanded)
            if (this.height == this.heights[0]) {
                this.height = this.heights[1]
            } else {
                this.height = this.heights[0]
            }
        },
    },
}
</script>

<style scoped>
.placeholder-card {
    width: 640px;
    height: 90px;
    background-color: rgb(70, 70, 70);
}
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
