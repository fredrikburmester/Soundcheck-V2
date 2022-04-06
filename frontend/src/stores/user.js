import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        authenticated: useLocalStorage('authenticated', false),
        token: useLocalStorage('token', ''),
        refresh_token: useLocalStorage('refresh_token', ''),
        id: useLocalStorage('id', ''),
        display_name: useLocalStorage('display_name', ''),
        email: useLocalStorage('email', ''),
        avatar: useLocalStorage('avatar', ''),
        top_songs: [],
    }),
    hydrate(storeState) {
        storeState.authenticated = useLocalStorage('authenticated', false)
        storeState.token = useLocalStorage('token', '')
        storeState.refresh_token = useLocalStorage('refresh_token', '')
        storeState.id = useLocalStorage('id', '')
        storeState.display_name = useLocalStorage('display_name', '')
        storeState.email = useLocalStorage('email', '')
        storeState.avatar = useLocalStorage('avatar', '')
    },
    getters: {
        isAuthenticated: (state) => state.authenticated,
        getToken: (state) => state.token,
        getId: (state) => state.id,
    },
    actions: {
        setId(value) {
            this.id = value
        },
        logout() {
            this.authenticated = false
            this.token = ''
            this.refresh_token = ''
            this.display_name = ''
            this.email = ''
            this.avatar = ''

            localStorage.setItem('authenticated', false)
            localStorage.setItem('token', '')
            localStorage.setItem('refresh_token', '')
            localStorage.setItem('name', '')
            localStorage.setItem('email', '')
            localStorage.setItem('avatar', '')
        },
        async getTopSongs(time_range, limit) {
            console.log(time_range, limit)
            if (!time_range) {
                time_range = 'medium_term'
            }

            if (!limit) {
                limit = 25
            }

            if (this.top_songs[time_range]) {
                // get only limit about from array
                return this.top_songs[time_range].slice(0, limit)
            }

            const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}`
            await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.token,
                },
            })
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    if (data.error) {
                        this.logout()
                        return
                    }
                    this.top_songs[this.time_range] = data.items
                })
            return this.top_songs[this.time_range]
        },
        async getUser() {
            let user = null
            const url = 'https://api.spotify.com/v1/me'
            const headers = {
                Authorization: `Bearer ${this.token}`,
            }
            await fetch(url, { headers })
                .then((response) => response.json())
                .then((data) => {
                    user = data
                    this.avatar = data.images[0].url
                    this.display_name = data.display_name
                    this.email = data.email
                    this.spotify_dataname = data.id
                })

            return user
        },
        async getUserAvatar() {
            if (this.avatar) {
                return this.avatar
            }

            await this.getUser()
            return this.avatar
        },
    },
})
