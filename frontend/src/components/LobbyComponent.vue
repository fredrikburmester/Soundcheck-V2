<template>
    <div id="lobby" class="flex w-screen md:max-w-3xl flex-col px-8 h-full">
        <div>
            <PageTitle :title="$route.params.id" subtitle="Welcome to the game room!" />
            <button class="btn btn-error btn-sm mb-4 mr-4" @click="$emit('leaveRoom')">Leave room</button>
            <label for="my-modal-6" class="btn btn-sm btn-success modal-button mb-4" @click="getInvitablePlayers">Invite friends</label>
            <input id="my-modal-6" type="checkbox" class="modal-toggle" />
            <div class="modal modal-bottom sm:modal-middle">
                <div class="modal-box bg-zinc-900">
                    <h3 class="font-bold text-lg mb-2">Invite others to play with!</h3>
                    <div class="form-control w-full">
                        <div
                            v-for="p in invitablePlayers"
                            :key="p.id"
                            class="flex flex-row w-full mb-4 bg-zinc-800 text-white pl-4 py-2 pr-2 rounded-lg items-center"
                        >
                            <span>
                                {{ p.name }}
                            </span>
                            <button class="btn btn-sm ml-auto" @click="invite($event, p.id)">Invite</button>
                        </div>
                        <p v-if="invitablePlayers.length == 0" class="font-bold italic">Hmm... Very empty, come back later!</p>
                    </div>
                    <div class="modal-action mb-12 lg:mb-2">
                        <label for="my-modal-6" class="btn btn-primary">Close</label>
                    </div>
                </div>
            </div>
            <h1 v-if="players.length == 1" class="font-bold text-xl italic mb-4">{{ players.length }} Player</h1>
            <h1 v-else class="font-bold text-xl italic mb-4">{{ players.length }} Players</h1>
        </div>
        <div id="player-view">
            <UserCard v-for="player in players" :key="player.id" :host="room.host.id == player.id" :img="player.img" :display-name="player.name" />
        </div>
        <button v-if="isHost()" class="btn btn-success shadow-md fixed-center-button" @click="$emit('startGame')">Start game</button>
    </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'

import UserCard from '../components/UserCard.vue'
import PageTitle from './PageTitle.vue'

export default {
    components: { UserCard, PageTitle },
    props: {
        players: {
            type: Array,
            required: true,
        },
        room: {
            type: Object,
            required: true,
        },
    },
    emits: ['leaveRoom', 'startGame'],
    data() {
        return {
            invitablePlayers: [],
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    sockets: {
        invitablePlayers(data) {
            this.invitablePlayers = data
        },
    },
    methods: {
        isHost() {
            return this.room.host.id == this.id
        },
        getInvitablePlayers() {
            this.$socket.client.emit('getInvitablePlayers')
        },
        invite(e, playerId) {
            e.target.innerHTML = 'Inviting...'
            let invite = {
                from: this.id,
                to: playerId,
                roomCode: this.room.code,
            }
            this.$socket.client.emit('invite', invite)
        },
    },
}
</script>

<style scoped>
#lobby {
    margin-bottom: 100px;
}
</style>
