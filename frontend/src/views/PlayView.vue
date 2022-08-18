<template>
    <div
        id="playview"
        class="flex mt-4 h-48 flex-col items-center lg:items-start lg:justify-items-center lg:flex-row px-4 lg:px-32 lg:py-12 space-y-12 lg:space-y-0 lg:space-x-12"
    >
        <div class="card shadow-xl image-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <div class="card-body">
                <h2 class="card-title">Create room</h2>
                <p>Be quick and create a room! Your friends can join!</p>
                <div class="card-actions justify-end">
                    <router-link to="/create">
                        <button class="btn btn-primary mt-2">Create room</button>
                    </router-link>
                </div>
            </div>
        </div>
        <div class="card h-72 shadow-xl image-full bg-gradient-to-r from-cyan-500 to-blue-500">
            <div class="card-body">
                <h2 class="card-title">Join room</h2>
                <p>Have your friends already created a room? Join it!</p>
                <div class="form-control flex flex-col items-end">
                    <input
                        v-model="room"
                        type="text"
                        placeholder="Type here"
                        class="input input-bordered input-info w-full max-w-xs capitalize"
                        style="text-transform: uppercase"
                    />

                    <div class="card-actions mt-4 justify-end">
                        <router-link :to="`/room/${room.toUpperCase()}`">
                            <button class="btn btn-primary">Join room</button>
                        </router-link>
                    </div>
                </div>
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
}
#playview {
    min-height: 90vh;
}
.card {
    width: 500px;
    max-width: 80vw;
}
/* devices smaller than 1000px */
@media (max-width: 1000px) {
    .btn {
        width: 150px !important;
    }
}
input {
    box-shadow: none !important;
}
*:focus {
    outline: none !important;
}
</style>
