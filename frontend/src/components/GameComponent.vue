<template>
    <div class="p-8 flex flex-col h-full">
        <PageTitle :title="$route.params.id" subtitle="Welcome to the game room!" />
        <button class="btn btn-error btn-sm mb-4" @click="$emit('leaveRoom')">Leave room</button>
        <h1 v-if="players.length == 1" class="font-bold text-xl italic mb-4">{{ players.length }} Player</h1>
        <h1 v-else class="font-bold text-xl italic mb-4">{{ players.length }} Players</h1>
        <UserCard v-for="player in players" :key="player.id" :host="room.host.id == player.id" :img="player.img" :display-name="player.name" />
        <button class="btn btn-success mt-auto mb-12 shadow-md">Start game</button>
    </div>
</template>
<script>
export default {}
</script>
