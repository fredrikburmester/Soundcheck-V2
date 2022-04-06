<template>
    <div class="hero min-h-8/10 p-4">
        <div class="hero-content flex-col items-center lg:flex-row-reverse">
            <div class="text-left">
                <h1 class="text-5xl font-bold">Create game room</h1>
                <p class="py-6">
                    Create a game room and invite your friends to join!
                    <br />
                    <br />
                    Each player will have to enter a unique room code.
                    <br />
                    <br />
                    Choose the number of top songs should be picked from each player and select if you want to see the correct answer after each question.
                </p>
            </div>
            <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <div class="card-body">
                    <div class="form-control">
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
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text text-opacity-50">Show correct guesses</span>
                                <input v-model="showCorrectGuesses" type="checkbox" class="toggle toggle-primary" checked />
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
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    sockets: {
        error(e) {
            console.log(e)
        },
        redirect(data) {
            this.$router.push(`/room/${data.id}`)
        },
    },
    methods: {
        createRoom() {
            this.$socket.client.emit('createRoom', {
                userId: this.id,
                roomCode: this.roomCode,
                nrOfSongs: this.nrOfSongs,
                showCorrectGuesses: this.showCorrectGuesses,
            })
        },
    },
}
</script>