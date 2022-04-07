<template>
    <div id="playview" class="flex flex-col place-content-around md:flex-row w-screen p-8">
        <div class="grid place-items-center md:w-64 flex-grow">
            <div class="place-items-start">
                <h1 class="text-2xl font-bold">Join room</h1>
                <label class="label">
                    <span class="label-text opacity-50">Room code</span>
                    <span class="label-text-alt"></span>
                </label>
                <input v-model="room" type="text" placeholder="ex. ABCD" class="input w-full max-w-xs mb-4 input-bordered" />
                <router-link :to="`/room/${room}`">
                    <button class="btn btn-primary w-full">Join room</button>
                </router-link>
            </div>
        </div>
        <div class="divider divider-vertical md:divider-horizontal grow-0">OR</div>
        <div class="grid place-items-center md:w-64 flex-grow">
            <div class="place-items-start">
                <h1 class="text-2xl font-bold mb-4">Create room</h1>
                <router-link to="/create">
                    <button class="btn btn-primary w-64">Create room</button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const room = ref('')
</script>
<style>
#playview {
    min-height: 90vh;
}
</style>
