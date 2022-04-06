<template>
    <div class="">
        Loading...
        <br />
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { mapWritableState, mapActions } from 'pinia'

export default {
    data() {
        return {}
    },
    computed: {
        ...mapWritableState(useUserStore, ['authenticated', 'token', 'refresh_token', 'id', 'display_name', 'email', 'avatar', 'id']),
    },
    mounted() {
        let code = window.location.href.split('/callback?code=')[1]
        this.$socket.client.emit('login-step-2', code)
    },
    methods: {
        ...mapActions(useUserStore, ['logout']),
        async getUserInformation() {
            const url = 'https://api.spotify.com/v1/me'
            const headers = {
                Authorization: `Bearer ${this.token}`,
            }
            var user = null
            await fetch(url, { headers })
                .then((response) => response.json())
                .then((data) => {
                    user = data
                })
                .catch((err) => {
                    console.log(err)
                    this.$router.push('/')
                })
            this.id = user.id
            this.display_name = user.display_name
            this.email = user.email
            this.avatar =
                user.images[0]?.url ||
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80'

            this.$socket.client.emit('login', {
                id: this.id,
                img: this.avatar,
                name: this.display_name,
            })

            this.$router.push('/')
        },
    },
    sockets: {
        loginData(data) {
            console.log(data)
            if (data.access_token) {
                this.token = data.access_token
                this.authenticated = true
                this.refresh_token = data.refresh_token
                this.getUserInformation()
            }
        },
    },
}
</script>
