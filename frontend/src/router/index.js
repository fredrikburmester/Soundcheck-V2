import { createRouter, createWebHistory } from 'vue-router'
import PlayView from '../views/PlayView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../components/NotFound.vue'
import CreateRoomView from '../views/CreateRoomView.vue'
import RoomView from '../views/RoomView.vue'
import CallbackView from '../views/CallbackView.vue'
import MyTopView from '../views/MyTopView.vue'
import HomeView from '../views/HomeView.vue'

import { useUserStore } from '@/stores/user'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/play',
            name: 'Play',
            component: PlayView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/',
            name: 'Home',
            component: HomeView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/create',
            name: 'Create',
            component: CreateRoomView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/room/:id',
            name: 'Room',
            component: RoomView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/login',
            name: 'Login',
            component: LoginView,
        },
        {
            path: '/logincallback',
            name: 'Callback',
            component: CallbackView,
        },
        {
            path: '/my-top/:id',
            name: 'MyTop',
            component: MyTopView,
            meta: {
                requiresAuth: true,
            },
        },
        // will match everything and put it under `$route.params.pathMatch`
        { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    ],
    scrollBehavior() {
        // always scroll to top
        return { top: 0 }
    },
})

router.beforeEach(async (to) => {
    const store = useUserStore()

    if (to.meta.requiresAuth) {
        const url = 'https://api.spotify.com/v1/me'
        const headers = {
            Authorization: `Bearer ${store.token}`,
        }
        await fetch(url, { headers }).then((response) => {
            if (response.status != 200) {
                store.logout()
                return
            }
        })
    }
})

export default router
