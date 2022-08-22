<template>
    <div class="hero min-h-screen min-h-8/10">
        <div class="hero-content flex-col lg:flex-row-reverse w-full">
            <div class="text-center lg:text-left lg:ml-8">
                <h1 class="text-5xl font-bold text-center">Soundcheck</h1>
                <p class="py-6 max-w-md text-center">
                    <span class="text-primary">Soundcheck</span>
                    is a game to play with your friends! Create a room, invite your friends, and guess each others favorite songs.
                    <span class="font-bold"> Listen to music, chat and have fun together!</span> <br /><br />
                    After the game you can create a mix-tape of all your favorite songs, perfect for a party.
                </p>
            </div>
            <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-300">
                <div class="card-body">
                    <div class="form-control">
                        <button class="btn btn-success text-base-100" @click="login">Login with spotify</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        login() {
            this.$socket.client.emit('login-step-1')
        },
    },
    sockets: {
        login(url) {
            window.location.href = url
        },
    },
}
</script>
