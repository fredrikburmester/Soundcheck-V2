<template>
    <div id="playview" class="flex flex-col place-content-around md:flex-row w-screen p-8">
        <div class="grid place-items-center md:w-64 flex-grow">
            <div class="flex flex-col place-items-start">
                <h1 class="text-2xl font-bold">Join room</h1>
                <label class="label">
                    <span class="label-text opacity-50">Room code</span>
                    <span class="label-text-alt"></span>
                </label>
                <input v-model="room" type="text" placeholder="ex. ABCD" class="input w-full max-w-xs mb-4 input-bordered" />
                <router-link :to="`/room/${room}`">
                    <button class="btn btn-primary">Join room</button>
                </router-link>
            </div>
        </div>
        <div class="divider divider-vertical md:divider-horizontal grow-0">OR</div>
        <div class="grid place-items-center md:w-64 flex-grow">
            <div class="place-items-start">
                <h1 class="text-2xl font-bold mb-4">Create room</h1>
                <router-link to="/create">
                    <button class="btn btn-primary">Create room</button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const room = ref('')
</script>
<style scoped>
.btn {
    width: 300px !important;
}
#playview {
    min-height: 90vh;
}
/* devices smaller than 1000px */
@media (max-width: 1000px) {
    .btn {
        width: 200px !important;
    }
}
</style>
