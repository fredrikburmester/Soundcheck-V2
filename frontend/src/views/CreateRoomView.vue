<template>
    <div class="hero min-h-8/10">
        <div class="hero-content flex-col items-center lg:flex-row-reverse pb-12 lg:mt-20">
            <div class="text-left lg:ml-24 px-8">
                <h1 class="text-5xl font-bold">Create game room</h1>
                <p class="py-6">
                    Create a room and invite your friends! Choose the <b>number</b> of top songs picked from each player, <b>when</b>join those songs were the
                    players favourite, and some additional settings.
                </p>
            </div>
            <div class="card flex-shrink-0 w-full max-w-sm shadow-md bg-base-300">
                <div class="card-body">
                    <div class="form-control mb-4">
                        <div class="form-control w-full max-w-xs mb-4">
                            <label class="label">
                                <span class="label-text text-opacity-50">Nr. of songs/player</span>
                                <span class="label-text-alt text-opacity-50">Long games!</span>
                            </label>

                            <input v-model="nrOfSongs" type="range" min="1" max="5" class="range" step="1" />
                            <div class="w-full flex justify-between text-xs px-2">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text text-opacity-50">Time range</span>
                        </label>
                        <div class="tabs tabs-boxed flex flex-row justify-center">
                            <a class="tab" @click="changeTimeRange($event, 'short_term')">Month</a>
                            <a class="tab tab-active" @click="changeTimeRange($event, 'medium_term')">Half Year</a>
                            <a class="tab" @click="changeTimeRange($event, 'long_term')">Year</a>
                        </div>
                    </div>
                    <div class="form-control mb-4">
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text text-opacity-50">Show correct guesses?</span>
                                <input v-model="showCorrectGuesses" disabled type="checkbox" class="toggle toggle-primary" checked />
                            </label>
                        </div>
                    </div>
                    <div class="form-control mb-4">
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text text-opacity-50">Allow song seeking?</span>
                                <input v-model="allowSongSeeking" type="checkbox" class="toggle toggle-primary" checked />
                            </label>
                        </div>
                    </div>
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text text-opacity-50">Generating random code...</span>
                        </label>
                        <input
                            v-model="roomCode"
                            type="text"
                            placeholder="Enter room code"
                            class="input input-bordered w-full max-w-xs"
                            style="text-transform: uppercase"
                            @focus="generateRoomCodeActive = false"
                        />
                        <label class="label cursor-pointer">
                            <span class="label-text label-text-alt text-opacity-50">Click to change it</span>
                        </label>
                    </div>
                    <div class="form-control mt-6">
                        <button class="btn btn-primary" @click="createRoom">Create!</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { mapWritableState } from 'pinia'
export default {
    setup() {
        const roomCode = ref('')
        const nrOfSongs = ref(2)
        const showCorrectGuesses = ref(false)
        const generateRoomCodeActive = ref(true)
        const time_range = ref('medium_term')
        const allowSongSeeking = ref(true)

        // generate random 4 letter room code
        const generateRoomCode = () => {
            const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
            let code = ''
            for (let i = 0; i < 4; i++) {
                code += letters[Math.floor(Math.random() * letters.length)]
            }
            return code
        }

        // update roomCode every second
        const updateRoomCode = () => {
            roomCode.value = generateRoomCode()
            if (generateRoomCodeActive.value) {
                setTimeout(updateRoomCode, 1000)
            }
        }

        updateRoomCode()

        return {
            roomCode,
            nrOfSongs,
            showCorrectGuesses,
            generateRoomCodeActive,
            generateRoomCode,
            updateRoomCode,
            time_range,
            allowSongSeeking,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    sockets: {
        error(e) {
            console.log(e)
        },
    },
    methods: {
        createRoom() {
            this.$socket.client.emit('createRoom', {
                userId: this.id,
                roomCode: this.roomCode,
                nrOfSongs: this.nrOfSongs,
                showCorrectGuesses: this.showCorrectGuesses,
                timeRange: this.time_range,
                allowSongSeeking: this.allowSongSeeking,
            })
        },
        changeTimeRange(e, time_range) {
            Array.from(document.getElementsByClassName('tab')).forEach((element) => {
                element.classList.remove('tab-active')
            })
            e.target.classList.toggle('tab-active')
            this.time_range = time_range
        },
    },
}
</script>
