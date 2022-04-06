import { createRouter, createWebHistory } from 'vue-router'
import PlayView from '../views/PlayView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../components/NotFound.vue'
import CreateRoomView from '../views/CreateRoomView.vue'
import RoomView from '../views/RoomView.vue'
import CallbackView from '../views/CallbackView.vue'
import MyTopSongsView from '../views/MyTopSongsView.vue'
import HomeView from '../views/HomeView.vue'

import { useUserStore } from '@/stores/user'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/play',
            name: 'play',
            component: PlayView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/create',
            name: 'create',
            component: CreateRoomView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/room/:id',
            name: 'room',
            component: RoomView,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/callback',
            name: 'callback',
            component: CallbackView,
        },
        {
            path: '/my-top-songs',
            name: 'MyTopSongs',
            component: MyTopSongsView,
            meta: {
                requiresAuth: true,
            },
        },
        // will match everything and put it under `$route.params.pathMatch`
        { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    ],
})

router.beforeEach(async (to) => {
    const store = useUserStore()
    if (to.meta.requiresAuth && (!store.isAuthenticated || store.getToken.length == 0)) return '/login'
})

export default router
