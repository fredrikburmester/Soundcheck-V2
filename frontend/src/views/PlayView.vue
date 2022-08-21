<template>
    <div class="flex pb-12 flex-col items-center lg:items-start lg:justify-items-center px-4 lg:px-32 space-y-8">
        <div class="w-full">
            <h1 class="font-bold text-3xl text-left self-start m-0">Play</h1>
            <p class="text-left self-start m-0 p-0">Create or join a room!</p>
        </div>
        <div class="rounded-2xl bg-stone-500 w-full p-4 fancy-card">
            <h1 class="text-xl font-bold mt-4 mx-4">Active Games</h1>
            <div v-for="game in activeGames" :key="game" class="px-4">
                <div class="w-full rounded-lg h-14 flex flex-row px-8 my-4 bg-gray-900 opacity-90 py-4 justify-between items-center">
                    <p>{{ game.code }}</p>
                    <button id="joinActiveRoomButton" class="btn btn-sm btn-success w-8" @click="joinRoom(game.code)">Join</button>
                </div>
            </div>
            <h2 v-if="activeGames.length == 0" class="pl-4 pb-4">No active games...</h2>
        </div>
        <hr class="w-full opacity-10" />
        <div class="card shadow-xl image-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <div class="card-body">
                <h2 class="card-title">Create room</h2>
                <p>Create a room and invite your friends!</p>
                <div class="card-actions justify-end">
                    <router-link to="/create">
                        <button class="btn btn-primary mt-2 btn-sm btn-outline">Create room</button>
                    </router-link>
                </div>
            </div>
        </div>
        <div class="card shadow-xl image-full bg-gradient-to-r from-cyan-500 to-blue-500">
            <div class="card-body p-8">
                <h2 class="card-title mb-2">Join room</h2>
                <div class="form-control flex flex-col items-end">
                    <input
                        v-model="room"
                        oninput="this.value = this.value.toUpperCase()"
                        type="text"
                        placeholder="Type here"
                        class="input w-full max-w-xs bg-gray-900"
                    />

                    <div class="card-actions mt-4 justify-end">
                        <router-link :to="`/room/${toUpperCase(room)}`">
                            <button class="btn btn-primary btn-sm btn-outline">Join room</button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            room: '',
            activeGames: [],
            loadingActiveGames: true,
        }
    },
    computed: {
        color1() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
        color2() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
        color3() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
        color4() {
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += Math.floor(Math.random() * 10)
            }
            return color
        },
    },
    mounted() {
        this.getActiveGames()
    },
    methods: {
        getActiveGames() {
            this.$socket.client.emit('getActiveGames')
        },
        joinRoom(code) {
            this.$router.push(`/room/${code}`)
        },
        toUpperCase(s) {
            return s.toUpperCase()
        },
    },
    sockets: {
        getActiveGames({ activeGames }) {
            console.log(activeGames)
            this.activeGames = activeGames
        },
    },
}
</script>

<style scoped>
.card {
    width: 500px;
    max-width: 80vw;
}
/* devices smaller than 1000px */
@media (max-width: 1000px) {
    .btn {
        width: 150px;
    }
}
input {
    box-shadow: none !important;
}
*:focus {
    outline: none !important;
}

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
#joinActiveRoomButton {
    width: 90px;
}
</style>
