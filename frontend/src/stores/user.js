import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import queryString from 'query-string'

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
        top_items: useLocalStorage('top_items', {}),
        roomCode: useLocalStorage('roomCode', ''),
        notification: useLocalStorage('notification', ''),
        notificationType: useLocalStorage('notificationType', 'error'),
        notifications: useLocalStorage('notifications', []),
        socketid: useLocalStorage('socketid', ''),
    }),
    hydrate(storeState) {
        storeState.authenticated = useLocalStorage('authenticated', false)
        storeState.token = useLocalStorage('token', '')
        storeState.refresh_token = useLocalStorage('refresh_token', '')
        storeState.id = useLocalStorage('id', '')
        storeState.display_name = useLocalStorage('display_name', '')
        storeState.email = useLocalStorage('email', '')
        storeState.avatar = useLocalStorage('avatar', '')
        storeState.top_items = useLocalStorage('top_items', {})
        storeState.roomCode = useLocalStorage('roomCode', '')
        storeState.notification = useLocalStorage('notification', '')
        storeState.notificationType = useLocalStorage('notificationType', 'error')
        storeState.notifications = useLocalStorage('notifications', [])
        storeState.socketid = useLocalStorage('socketid', '')
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
            this.top_items = {}
            this.roomCode = ''
            this.notification = ''
            this.notificationType = 'error'
            this.notifications = []
            this.socketid = ''

            localStorage.setItem('authenticated', false)
            localStorage.setItem('token', '')
            localStorage.setItem('refresh_token', '')
            localStorage.setItem('name', '')
            localStorage.setItem('email', '')
            localStorage.setItem('avatar', '')
            localStorage.setItem('top_items', {})
            localStorage.setItem('roomCode', '')
            localStorage.setItem('notification', '')
            localStorage.setItem('notificationType', 'error')
            localStorage.setItem('notifications', [])
            localStorage.setItem('socketid', '')

            this.$router.push({ name: 'Login' })
        },
        async createPlaylist(tracks, name) {
            const url = `https://api.spotify.com/v1/users/${this.id}/playlists`
            const body = {
                collaborative: false,
                description: 'From Soundcheck!',
                name: name,
                public: true,
            }
            let result

            await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify(body),
            })
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    result = data
                })

            let playlistId = result.id

            // create string from tracks array
            let trackString = ''
            for (let i = 0; i < tracks.length; i++) {
                trackString += `spotify:track:${tracks[i].id}`
                if (i !== tracks.length - 1) {
                    trackString += ','
                }
            }

            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackString}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
            })
                .then((response) => {
                    if (response.status === 201) {
                        this.notification = 'The playlist has been created and added to your account!'
                        this.notificationType = 'success'
                    }
                    return response.json()
                })
                .then((data) => {
                    result = data
                })
            return result
        },
        async getTopSongs(time_range, limit, type) {
            this.top_items = {
                tracks: {
                    short_term: this.top_items?.tracks?.short_term || [],
                    medium_term: this.top_items?.tracks?.medium_term || [],
                    long_term: this.top_items?.tracks?.long_term || [],
                },
                artists: {
                    short_term: this.top_items?.artists?.short_term || [],
                    medium_term: this.top_items?.artists?.medium_term || [],
                    long_term: this.top_items?.artists?.long_term || [],
                },
            }

            if (!time_range) {
                time_range = 'medium_term'
            }

            if (!limit) {
                limit = 25
            }

            if (!type) {
                type = 'tracks'
            }

            if (this.top_items[type][time_range].length >= limit) {
                // get only limit about from array
                return this.top_items[type][time_range].slice(0, limit)
            }

            const url = `https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=${limit}`
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
                    this.top_items[type][time_range] = data.items
                })
            return this.top_items[type][time_range]
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
                .catch((err) => {
                    console.log(err)
                    this.logout()
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
