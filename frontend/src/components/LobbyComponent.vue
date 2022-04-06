<template>
    <div class="flex w-screen md:max-w-3xl flex-col p-8 h-full">
        <PageTitle :title="$route.params.id" subtitle="Welcome to the game room!" />
        <button class="btn btn-error btn-sm mb-4" @click="$emit('leaveRoom')">Leave room</button>
        <h1 v-if="players.length == 1" class="font-bold text-xl italic mb-4">{{ players.length }} Player</h1>
        <h1 v-else class="font-bold text-xl italic mb-4">{{ players.length }} Players</h1>
        <UserCard v-for="player in players" :key="player.id" :host="room.host.id == player.id" :img="player.img" :display-name="player.name" />
        <button v-if="isHost()" class="btn btn-success mt-auto mb-12 shadow-md" @click="$emit('startGame')">Start game</button>
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
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    methods: {
        isHost() {
            console.log(this.room.host.id, this.id)
            return this.room.host.id == this.id
        },
    },
}
</script>

<style scoped></style>
