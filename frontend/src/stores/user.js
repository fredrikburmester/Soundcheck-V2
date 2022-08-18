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
        roomCode: useLocalStorage('roomCode', ''),
        notification: useLocalStorage('notification', ''),
        notificationType: useLocalStorage('notificationType', 'error'),
        notifications: useLocalStorage('notifications', []),
        features: useLocalStorage('features', []),
        socketid: useLocalStorage('socketid', ''),
        topItems: [],
        activeUsers: 0,
    }),
    hydrate(storeState) {
        storeState.authenticated = useLocalStorage('authenticated', false)
        storeState.token = useLocalStorage('token', '')
        storeState.refresh_token = useLocalStorage('refresh_token', '')
        storeState.id = useLocalStorage('id', '')
        storeState.display_name = useLocalStorage('display_name', '')
        storeState.email = useLocalStorage('email', '')
        storeState.avatar = useLocalStorage('avatar', '')
        storeState.roomCode = useLocalStorage('roomCode', '')
        storeState.notification = useLocalStorage('notification', '')
        storeState.notificationType = useLocalStorage('notificationType', 'error')
        storeState.notifications = useLocalStorage('notifications', [])
        storeState.features = useLocalStorage('features', [])
        storeState.socketid = useLocalStorage('socketid', '')
        storeState.activeUsers = 0
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
            this.roomCode = ''
            this.notification = ''
            this.notificationType = 'error'
            this.notifications = []
            this.socketid = ''
            this.topItems = []

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
        async getMoreTopSongs(timeRange, itemType, limit, offset) {
            if (!timeRange) {
                console.error('time_range is required')
                return
            }

            if (!limit) {
                console.error('No limit specified')
                return
            }

            if (itemType != 'tracks' && itemType != 'artists') {
                console.error('type must be either tracks or artists')
                return
            }

            if (!offset) {
                console.error('no offset specified')
                return
            }

            const url = `https://api.spotify.com/v1/me/top/${itemType}?time_range=${timeRange}&limit=${limit}&offset=${offset}`
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

                    for (let i = 0; i < data.items.length; i++) {
                        const track = data.items[i]
                        let trackItem = {
                            data: track,
                            id: track.id,
                            uuid: `${track.id}-${itemType}-${timeRange}`,
                            itemType: itemType,
                            timeRange: timeRange,
                            index: offset + i,
                            previousIndex: [],
                            dateAdded: new Date(),
                        }

                        let found = false
                        for (let j = 0; j < this.topItems.length; j++) {
                            if (this.topItems[j].uuid === trackItem.uuid) {
                                found = true
                                break
                            }
                        }
                        if (!found) {
                            this.topItems.push(trackItem)
                        }
                    }
                })
            return this.topItems
        },
        async getTopSongs(timeRange, limit, itemType) {
            if (!timeRange) {
                console.error('timeRange is required')
                return
            }

            if (!limit) {
                console.error('No limit specified')
                return
            }

            if (itemType != 'tracks' && itemType != 'artists') {
                console.error('itemType must be either tracks or artists')
                return
            }

            this.topItems = []

            const url = `https://api.spotify.com/v1/me/top/${itemType}?time_range=${timeRange}&limit=${limit}`
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

                    for (let i = 0; i < data.items.length; i++) {
                        const track = data.items[i]
                        let trackItem = {
                            data: track,
                            id: track.id,
                            uuid: `${track.id}-${itemType}-${timeRange}`,
                            itemType: itemType,
                            timeRange: timeRange,
                            index: i,
                            previousIndex: [],
                            dateAdded: new Date(),
                        }

                        let found = false
                        for (let j = 0; j < this.topItems.length; j++) {
                            if (this.topItems[j].uuid === trackItem.uuid) {
                                found = true
                                break
                            }
                        }
                        if (!found) {
                            this.topItems.push(trackItem)
                        }
                    }
                    return this.topItems
                })
            return this.topItems
        },
        async getSongFeatures(ids) {
            let idString = ''
            for (let i = 0; i < ids.length; i++) {
                idString += ids[i]
                if (i !== ids.length - 1) {
                    idString += ','
                }
            }

            const url = `https://api.spotify.com/v1/audio-features?ids=${idString}`
            let res = null
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
                    res = data.audio_features
                })

            this.features = res
            return this.features
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
