<template>
    <div class="card max-w-2xl bg-base-100 shadow-xl image-full mb-4" @click="goToRoom">
        <div class="card-body flex flex-row items-center">
            <div class="flex flex-col w-full">
                <div class="flex flex-row items-center">
                    <div class="flex flex-col items-start">
                        <h2 class="card-title">{{ room.code }}</h2>
                        <p class="italic text-slate-400">{{ room.date }}</p>
                        <ul>
                            <li v-for="player in room.users" :key="player">{{ player.name }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    // eslint-disable-next-line vue/require-prop-types
    props: ['room'],
    mounted() {
        console.log(this.room)
    },
    methods: {
        goToRoom() {
            this.$router.push(`/room/${this.room.code}`)
        },
    },
}
</script>

<style scoped>
.card {
    width: 100%;
}
.placeholder-card {
    width: 640px;
    height: 100px;
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
