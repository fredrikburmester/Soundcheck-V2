<template>
    <div class="flex w-screen justify-start px-8 md:px-32 md:mt-16">
        <div class="flex flex-col space-y-12 items-start mb-12">
            <div class="flex flex-row space-x-8 items-center">
                <div class="avatar pt-2">
                    <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img :src="avatar" />
                    </div>
                </div>
                <p class="text-2xl">{{ display_name }}</p>
            </div>
            <div class="h-56 card bg-base-100 shadow-xl image-full">
                <figure id="bg1"></figure>
                <div class="card-body">
                    <h2 class="card-title">Soundcheck!?</h2>
                    <p>Can you guess your friends favorite songs?</p>
                    <div class="card-actions justify-end">
                        <router-link to="/play">
                            <button class="btn btn-primary">Play now</button>
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="h-56 card bg-base-100 shadow-xl image-full">
                <figure id="bg2"></figure>
                <div class="card-body">
                    <h2 class="card-title">My top songs</h2>
                    <p>Check out your sop songs!</p>
                    <div class="card-actions justify-end">
                        <router-link to="/my-top-songs">
                            <button class="btn btn-primary">enter</button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'
export default {
    props: {},
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['display_name', 'avatar']),
    },
    mounted() {},
    sockets: {},
    methods: {},
}
</script>

<style scoped>
#bg1 {
    background: rgb(131, 58, 180);
    background: linear-gradient(43deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);
}
#bg2 {
    background: rgb(34, 193, 195);
    background: linear-gradient(43deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
}
</style>
